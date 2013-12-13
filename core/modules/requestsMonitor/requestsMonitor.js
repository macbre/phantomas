/**
 * Simple HTTP requests monitor and analyzer
 */
exports.version = '1.1';

exports.module = function(phantomas) {
	// imports
	var HTTP_STATUS_CODES = phantomas.require('http').STATUS_CODES,
		parseUrl = phantomas.require('url').parse;

	var requests = [];

	// register metric
	phantomas.setMetric('requests');
	phantomas.setMetric('gzipRequests');
	phantomas.setMetric('postRequests');
	phantomas.setMetric('httpsRequests');
	phantomas.setMetric('redirects');
	phantomas.setMetric('notFound');
	phantomas.setMetric('timeToFirstByte');
	phantomas.setMetric('timeToLastByte');
	phantomas.setMetric('bodySize'); // content only
	phantomas.setMetric('contentLength'); // content only

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

	// when the monitoring started?
	var loadStartedTime;
	phantomas.on('loadStarted', function(res) {
		loadStartedTime = Date.now();
	});

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
		phantomas.emit('beforeSend', entry, res);

		if ( (entry.isBlocked === true) && (typeof request !== 'undefined') ) {
			phantomas.log('Blocked request: <' + entry.url + '>');
			request.abort();
			return;
		}

		// proceed
		phantomas.emit('send', entry, res);
	});

	phantomas.on('onResourceReceived', function(res) {
		// fix for blocked requests still "emitting" onResourceReceived with "stage" = 'end' and empty "status" (issue #122)
		if (res.status === null) {
			return;
		}

		// current request data
		var entry = requests[res.id] || {};

		switch(res.stage) {
			// the beginning of response
			case 'start':
				entry.recvStartTime = res.time;
				entry.timeToFirstByte = res.time - entry.sendTime;

				// FIXME: buggy
				// @see https://github.com/ariya/phantomjs/issues/10169
				entry.bodySize += res.bodySize || 0;
				break;

			// the end of response
			case 'end':
				// timing
				entry.recvEndTime = res.time;
				entry.timeToLastByte = res.time - entry.sendTime;
				entry.receiveTime = entry.recvEndTime - entry.recvStartTime;

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
						// should equal bodySize
						case 'content-length':
							entry.contentLength = parseInt(header.value, 10);
							break;

						// detect content type
						case 'content-type':
							// parse header value
							var value = header.value.split(';').shift().toLowerCase();

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
									entry.type = 'image';
									entry.isImage = true;
									break;

								// @see http://stackoverflow.com/questions/2871655/proper-mime-type-for-fonts
								case 'application/font-wof':
								case 'application/font-woff':
								case 'application/vnd.ms-fontobject':
								case 'application/x-font-opentype':
								case 'application/x-font-truetype':
								case 'application/x-font-ttf':
								case 'application/x-font-woff':
									entry.type = 'webfont';
									entry.isWebFont = true;
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
					}
				});

				parseEntryUrl(entry);

				// HTTP code
				entry.status = res.status || 200 /* for base64 data */;
				entry.statusText = HTTP_STATUS_CODES[entry.status];

				switch(entry.status) {
					case 301: // Moved Permanently
					case 302: // Found
						entry.isRedirect = true;
						phantomas.incrMetric('redirects');
						phantomas.addOffender('redirects', entry.url + ' is a redirect (HTTP ' + entry.status + ' ' + entry.statusText + ') ' +
							'to ' + (res.redirectURL || (res.url.replace(/\/$/, '') + entry.headers.Location)));
						break;

					case 404: // Not Found
						phantomas.incrMetric('notFound');
						phantomas.addOffender('notFound', entry.url);
						break;
				}

				// requests stats
				if (!entry.isBase64) {
					phantomas.incrMetric('requests');

					phantomas.incrMetric('bodySize', entry.bodySize); // content only
					phantomas.incrMetric('contentLength', entry.contentLength || entry.bodySize); // content only
				}

				if (entry.gzip) {
					phantomas.incrMetric('gzipRequests');
				}

				if (entry.isSSL) {
					phantomas.incrMetric('httpsRequests');
					phantomas.addOffender('httpsRequests', entry.url);
				}

				// emit an event for other modules
				phantomas.emit(entry.isBase64 ? 'base64recv' : 'recv' , entry, res);
				//phantomas.log(entry);
				break;
		}
	});

	// TTFB / TTLB metrics
	var ttfbMeasured = false;

	phantomas.on('recv', function(entry, res) {
		// check the first response which is not a redirect (issue #74)
		if (!ttfbMeasured && !entry.isRedirect) {
			phantomas.setMetric('timeToFirstByte', entry.timeToFirstByte);
			phantomas.setMetric('timeToLastByte', entry.timeToLastByte);

			ttfbMeasured = true;

			phantomas.emit('responseEnd', entry, res);
		}

		// completion of the last HTTP request
		phantomas.setMetric('httpTrafficCompleted', entry.recvEndTime - loadStartedTime);
	});
};
