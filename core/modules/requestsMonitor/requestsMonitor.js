/**
 * Simple HTTP requests monitor and analyzer
 */
'use strict';

exports.version = '1.2';

exports.module = function(phantomas) {
	// imports
	var HTTP_STATUS_CODES = phantomas.require('http').STATUS_CODES,
		parseUrl = phantomas.require('url').parse;

	var requests = [];

	// register metric
	phantomas.setMetric('requests');              // @desc total number of HTTP requests made
	phantomas.setMetric('gzipRequests');          // @desc number of gzipped HTTP responses @unreliable
	phantomas.setMetric('postRequests');          // @desc number of POST requests
	phantomas.setMetric('httpsRequests');         // @desc number of HTTPS requests
	phantomas.setMetric('notFound');              // @desc number of HTTP 404 responses
	phantomas.setMetric('bodySize');              // @desc size of the uncompressed content of all responses @unreliable
	phantomas.setMetric('contentLength');         // @desc size of the content of all responses (based on Content-Length header) @unreliable
	phantomas.setMetric('httpTrafficCompleted');  // @desc time it took to receive the last byte of the last HTTP response

	// parse given URL to get protocol and domain
	function parseEntryUrl(entry) {
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
	}

	phantomas.on('onResourceRequested', function(res, request) {
		// store current request data
		var entry = requests[res.id] = {
			id: res.id,
			url: res.url,
			method: res.method,
			requestHeaders: {},
			sendTime: res.time,
			bodySize: 0,
			isBlocked: false
		};

		// allow modules to block requests
		entry.block = function() {
			this.isBlocked = true;
		};

		res.headers.forEach(function(header) {
			entry.requestHeaders[header.name] = header.value;

			switch (header.name.toLowerCase()) {
				// AJAX requests
				case 'x-requested-with':
					if (header.value === 'XMLHttpRequest') {
						entry.isAjax = true;
					}
					break;
			}
		});

		parseEntryUrl(entry);

		if (entry.isBase64) {
			return;
		}

		// give modules a chance to block requests using entry.block()
		// @see https://github.com/ariya/phantomjs/issues/10230
		phantomas.emitInternal('beforeSend', entry, res); // @desc allows the request to be blocked

		if ( (entry.isBlocked === true) && (typeof request !== 'undefined') ) {
			phantomas.log('Blocked request: <' + entry.url + '>');
			request.abort();
			return;
		}

		// proceed
		phantomas.emitInternal('send', entry, res); // @desc request has been sent
	});

	phantomas.on('onResourceReceived', function(res) {
		// current request data
		var entry = requests[res.id] || {};

		// fix for blocked requests still "emitting" onResourceReceived with "stage" = 'end' and empty "status" (issue #122)
		if (res.status === null ) {
			if (entry.isBlocked) {
				return;
			} else if (!entry.isBase64) {
				phantomas.log('Blocked request by phantomjs: <' + entry.url + '>');
				phantomas.emitInternal('abort', entry, res); // @desc request has been blocked
			}
		}

		switch(res.stage) {
			// the beginning of response
			case 'start':
				entry.recvStartTime = res.time;
				entry.timeToFirstByte = res.time - entry.sendTime;

				// FIXME: buggy
				// @see https://github.com/ariya/phantomjs/issues/10169
				entry.bodySize = res.bodySize || 0;
				break;

			// the end of response
			case 'end':
				// SlimerJS sets res.bodySize at stage = end
				entry.bodySize = entry.bodySize || res.bodySize;

				// timing
				entry.recvEndTime = res.time;
				entry.timeToLastByte = res.time - entry.sendTime;
				entry.receiveTime = entry.recvEndTime - entry.recvStartTime;

				// issue #295
				if (typeof entry.recvStartTime === 'undefined') {
					phantomas.log('recv: "start" stage not registered for <%s>!', res.url);
					entry.receiveTime = entry.recvEndTime - entry.sendTime;
				}

				// request method
				switch(entry.method) {
					case 'POST':
						phantomas.incrMetric('postRequests');
						phantomas.addOffender('postRequests', entry.url);
						break;
				}

				// asset type
				entry.type = 'other';

				// analyze HTTP headers
				entry.headers = {};
				res.headers.forEach(function(header) {
					entry.headers[header.name] = header.value;

					switch (header.name.toLowerCase()) {
						// TODO: why it's not gzipped?
						// because: https://github.com/ariya/phantomjs/issues/10156
						case 'content-length':
							entry.contentLength = parseInt(header.value, 10);

							/**
							if (entry.bodySize !== entry.contentLength) {
								phantomas.log('%s: %j', 'bodySize vs contentLength', {url: entry.url, bodySize: entry.bodySize, contentLength: entry.contentLength});
							}
							**/
							break;

						// detect content type
						case 'content-type':
							// parse header value
							var value = header.value.split(';').shift().toLowerCase();
							entry.contentType = value;

							switch(value) {
								case 'text/html':
									entry.type = 'html';
									entry.isHTML = true;
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
								case 'font/ttf':
								case 'font/woff':
									entry.type = 'webfont';
									entry.isWebFont = true;
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

								default:
									phantomas.log('Unknown content type found: ' + value + ' for <' + entry.url + '>');
							}
							break;

						// detect content encoding
						case 'content-encoding':
							if (header.value === 'gzip') {
								entry.gzip = true;
							}
							break;

						// detect cookies (issue #92)
						case 'set-cookie':
							entry.hasCookies = true;
							break;
					}
				});

				parseEntryUrl(entry);

				// HTTP code
				entry.status = res.status || 200 /* for base64 data */;
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

				// default value (if Content-Length header is not present in the response or it's base64-encoded)
				// see issue #137
				if (typeof entry.contentLength === 'undefined') {
					entry.contentLength = entry.bodySize;
					phantomas.log('%s: %j', 'contentLength missing', {url: entry.url, bodySize: entry.bodySize});
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
					phantomas.emitInternal('base64recv', entry, res); // @desc base64-encoded "response" has been received
				}
				else {
					phantomas.emitInternal('recv' , entry, res); // @desc response has been received
				}
				break;
		}
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
