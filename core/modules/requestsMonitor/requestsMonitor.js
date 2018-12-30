/**
 * Simple HTTP requests monitor and analyzer
 */
'use strict';

const assert = require('assert'),
	debug = require('debug')('phantomas:modules:requestsMonitor');

// parse given URL to get protocol and domain
function parseEntryUrl(entry) {
	const parseUrl = require('url').parse;
	var parsed;

	if (entry.url.indexOf('data:') !== 0) {
		// @see http://nodejs.org/api/url.html#url_url
		parsed = parseUrl(entry.url) || {};

		entry.protocol = parsed.protocol.replace(':', '');
		entry.domain = parsed.hostname;
		entry.query = parsed.query;

		if (entry.protocol === 'https') {
			entry.isSSL = true;
		}
	}
	else {
		// base64 encoded data
		entry.domain = false;
		entry.protocol = false;
		entry.isBase64 = true;
	}

	return entry;
}

/**
 * Detect response content type using "Content-Type header value"
 * 
 * @param {string} headerValue 
 * @param {object} entry 
 */
function addContentType(headerValue, entry) {
	var value = headerValue.split(';').shift().toLowerCase();
	entry.contentType = value;

	switch(value) {
		case 'text/html':
			entry.type = 'html';
			entry.isHTML = true;
			break;

		case 'text/xml':
			entry.type = 'xml';
			entry.isXML = true;
			break;

		case 'text/css':
			entry.type = 'css';
			entry.isCSS = true;
			break;

		case 'application/x-javascript':
		case 'application/javascript':
		case 'text/javascript':
			entry.type = 'js';
			entry.isJS = true;
			break;

		case 'application/json':
			entry.type = 'json';
			entry.isJSON = true;
			break;

		case 'image/png':
		case 'image/jpeg':
		case 'image/gif':
		case 'image/svg+xml':
		case 'image/webp':
			entry.type = 'image';
			entry.isImage = true;

			if (value === 'image/svg+xml') {
				entry.isSVG = true;
			}
			break;

		case 'video/webm':
			entry.type = 'video';
			entry.isVideo = true;
			break;

		// @see http://stackoverflow.com/questions/2871655/proper-mime-type-for-fonts
		case 'application/font-wof':
		case 'application/font-woff':
		case 'application/vnd.ms-fontobject':
		case 'application/x-font-opentype':
		case 'application/x-font-truetype':
		case 'application/x-font-ttf':
		case 'application/x-font-woff':
		case 'font/opentype':
		case 'font/ttf':
		case 'font/woff':
			entry.type = 'webfont';
			entry.isWebFont = true;

			if (/ttf|truetype$/.test(value)) {
				entry.isTTF = true;
			}
			break;

		case 'application/octet-stream':
			var ext = (entry.url || '').split('.').pop();

			switch(ext) {
				// @see http://stackoverflow.com/questions/2871655/proper-mime-type-for-fonts#comment-8077637
				case 'otf':
					entry.type = 'webfont';
					entry.isWebFont = true;
					break;
			}
			break;

		case 'image/x-icon':
		case 'image/vnd.microsoft.icon':
			entry.type = 'favicon';
			entry.isFavicon = true;
			break;

		default:
			debug('Unknown content type found: ' + value + ' for <' + entry.url + '>');
	}

	return entry;
}

module.exports = function(phantomas) {
	// imports
	var HTTP_STATUS_CODES = require('http').STATUS_CODES;

	// register metric
	phantomas.setMetric('requests');              // @desc total number of HTTP requests made
	phantomas.setMetric('gzipRequests');          // @desc number of gzipped HTTP responses @unreliable
	phantomas.setMetric('postRequests');          // @desc number of POST requests
	phantomas.setMetric('httpsRequests');         // @desc number of HTTPS requests
	phantomas.setMetric('notFound');              // @desc number of HTTP 404 responses
	phantomas.setMetric('bodySize');              // @desc size of the uncompressed content of all responses
	phantomas.setMetric('transferedSize');        // @desc size of the compressed content of all responses, i.e. what was transfered in packets
	phantomas.setMetric('httpTrafficCompleted');  // @desc time it took to receive the last byte of the last HTTP response

	var requests = {};

	phantomas.on('request',	/** @param {Request} request **/ (request) => {
		const resId = request._requestId;
		requests[resId] = request;

		// request data
		// https://github.com/GoogleChrome/puppeteer/blob/v1.11.0/docs/api.md#class-request
		phantomas.emit('send', request); // @desc request has been sent
	});

	phantomas.on('response', /** @param {Response} resp **/ resp => {
		const resId = resp._requestId,
			request = requests[resId];

		var entry = {
			id: resId,
			url: resp.url,
			method: request.method,
			headers: resp.headers,
			bodySize: resp.dataLength,
			transferedSize: resp.encodedDataLength,
		};

		entry = parseEntryUrl(entry);

		/**
		 * Time to First Byte is the amount of time it takes for the browser
		 * to receive the first byte of data from the server
		 * after the browser makes the request.
		 * 
		 * https://developers.google.com/web/tools/chrome-devtools/network-performance/reference#timing-explanation
		 * https://www.w3.org/TR/navigation-timing/#performancetiming
		 * https://chromedevtools.github.io/devtools-protocol/tot/Network#type-ResourceTiming
		 * 
		 * All times are in seconds!
		 */
		if (!entry.isBase64) {
			// resp.timing is empty when handling data:image/gif;base64,R0lGODlhAQABAIABAAAAAP///yH5BAEAAAEALAAAAAABAAEAQAICTAEAOw%3D%3D
			assert(typeof resp.timing !== 'undefined', 'resp.timing is empty when handling ' + resp.url);

			// how long a given request stalled waiting for DNS, proxy, connection, SSL negotation, etc.
			entry.stalled = resp.timing.sendStart;

			// how it took to receive a first byte of the response after making a request
			entry.timeToFirstByte = resp.timing.receiveHeadersEnd - resp.timing.sendEnd;

			// difference between when the request was sent and when it was received
			entry.timeToLastByte = resp._timestamp - request._timestamp;
		}

		// POST requests
		if (entry.method === 'POST') {
			phantomas.incrMetric('postRequests');
			phantomas.addOffender('postRequests', entry.url);
		}

		// response content type
		// https://chromedevtools.github.io/devtools-protocol/tot/Network#type-ResourceType
		Object.keys(entry.headers).forEach(headerName => {
			const headerValue = entry.headers[headerName];

			switch(headerName.toLowerCase()) {
				// detect content type
				case 'content-type':
					entry = addContentType(headerValue, entry);
					break;

				// content compression
				case 'content-encoding':
					if (headerValue === 'gzip') {
						entry.gzip = true;

						phantomas.log('Response compressed with %s, %f kB -> %f kB (x%f)',
							headerValue, entry.bodySize / 1024, entry.transferedSize / 1024, entry.bodySize / entry.transferedSize);
					}
					break;

				// detect cookies (issue #92)
				case 'set-cookie':
					entry.hasCookies = true;
					break;
			}
		});

		// asset type
		entry.type = 'other';

		// HTTP code
		entry.status = resp.status || 200; // for base64 data
		entry.statusText = HTTP_STATUS_CODES[entry.status];

		switch(entry.status) {
			case 301: // Moved Permanently
			case 302: // Found
			case 303: // See Other
				entry.isRedirect = true;
				break;

			case 404: // Not Found
				phantomas.incrMetric('notFound');
				phantomas.addOffender('notFound', entry.url);
				break;
		}

		// requests stats
		if (!entry.isBase64) {
			phantomas.incrMetric('requests');

			phantomas.incrMetric('bodySize', entry.bodySize);
			phantomas.incrMetric('contentLength', entry.contentLength);
		}

		if (entry.gzip) {
			phantomas.incrMetric('gzipRequests');
			phantomas.addOffender('gzipRequests', '%s (gzip: %s kB / uncompressed: %s kB)', entry.url, (entry.contentLength/1024).toFixed(2), (entry.bodySize/1024).toFixed(2));
		}

		if (entry.isSSL) {
			phantomas.incrMetric('httpsRequests');
			phantomas.addOffender('httpsRequests', entry.url);
		}

		if (entry.isBase64) {
			phantomas.emit('base64recv', entry, resp); // @desc base64-encoded "response" has been received
		}
		else {
			phantomas.log('recv: HTTP %d <%s> [%s]', entry.status, entry.url, entry.contentType);
			phantomas.emit('recv' , entry, resp); // @desc response has been received
		}

		phantomas.log('Response metadata: %j', entry);
	});
	

	// completion of the last HTTP request
	var loadStartedTime;
	phantomas.on('loadStarted', function(res) {
		// when the monitoring started?
		loadStartedTime = Date.now();
	});

	phantomas.on('recv', function(entry, res) {
		phantomas.setMetric('httpTrafficCompleted', entry.recvEndTime - loadStartedTime);
	});
};
