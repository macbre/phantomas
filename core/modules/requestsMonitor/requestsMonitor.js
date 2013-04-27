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
	var start;
	phantomas.on('pageOpen', function(res) {
		start = Date.now();
	});

	phantomas.on('onResourceRequested', function(res) {
		// store current request data
		var entry = requests[res.id] = {
			id: res.id,
			url: res.url,
			method: res.method,
			requestHeaders: {},
			sendTime: res.time,
			bodySize: 0
		};

		res.headers.forEach(function(header) {
			entry.requestHeaders[header.name] = header.value;
		});

		parseEntryUrl(entry);

		if (!entry.isBase64) {
			phantomas.emit('send', entry, res);
		}
	});

	phantomas.on('onResourceReceived', function(res) {
		// current request data
		var entry = requests[res.id];

		switch(res.stage) {
			// the beginning of response
			case 'start':
				entry.recvStartTime = res.time;
				entry.timeToFirstByte = res.time - entry.sendTime;

				// FIXME: buggy
				// @see http://code.google.com/p/phantomjs/issues/detail?id=169
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
						break;
				}

				// HTTP code
				entry.status = res.status || 200 /* for base64 data */;
				entry.statusText = HTTP_STATUS_CODES[entry.status];

				switch(entry.status) {
					case 301:
					case 302:
						phantomas.incrMetric('redirects');
						phantomas.addNotice(entry.url + ' is a redirect (HTTP ' + entry.status + ')');
						break;

					case 404:
						phantomas.incrMetric('notFound');
						phantomas.addNotice(entry.url + ' was not found (HTTP 404)');
						break;
				}

				parseEntryUrl(entry);

				// asset type
				entry.type = 'other';

				// analyze HTTP headers
				entry.headers = {};
				res.headers.forEach(function(header) {
					entry.headers[header.name] = header.value;

					switch (header.name.toLowerCase()) {
						// TODO: why it's not gzipped?
						// because: http://code.google.com/p/phantomjs/issues/detail?id=156
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

								case 'image/png':
								case 'image/jpeg':
								case 'image/gif':
									entry.type = 'image';
									entry.isImage = true;
									break;

								default:
									phantomas.addNotice('Unknown content type found: ' + value);
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

				// requests stats
				if (!entry.isBase64) {
					phantomas.incrMetric('requests');

					phantomas.incrMetric('bodySize', entry.bodySize); // content only
					phantomas.incrMetric('contentLength', entry.contentLength || entry.bodySize); // content only
				}

				if (entry.gzip) {
					phantomas.incrMetric('gzipRequests');
				}

				// emit an event for other modules
				phantomas.emit(entry.isBase64 ? 'base64recv' : 'recv' , entry, res);
				//phantomas.log(entry);
				break;
		}
	});

	// TTFB / TTLB metrics
	phantomas.on('recv', function(entry, res) {
		// check the first request
		if (entry.id === 1) {
			phantomas.setMetric('timeToFirstByte', entry.timeToFirstByte);
			phantomas.setMetric('timeToLastByte', entry.timeToLastByte);
		}

		// completion of the last HTTP request
		phantomas.setMetric('httpTrafficCompleted', entry.recvEndTime - start);
	});
};
