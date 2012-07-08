/**
 * Simple HTTP requests monitor and analyzer
 */
exports.version = '1.0';

exports.module = function(phantomas) {
	// imports
	var http = require('http'),
		url = require('url'),
		HTTP_STATUS_CODES = http.STATUS_CODES,
		parseUrl = url.parse;

	var requests = [];

	// register metric
	phantomas.setMetric('HTTPRequests');

	phantomas.on('onResourceRequested', function(res) {
		// store current request data
		requests[res.id] = {
			url: res.url,
			sendTime: res.time
		};

		phantomas.incrMetric('HTTPRequests');
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
				entry.bodySize = res.bodySize || 0;
				break;

			// the end of response
			case 'end':
				// timing
				entry.recvEndTime = res.time;
				entry.timeToLastByte = res.time - entry.sendTime;
				entry.receiveTime = entry.recvEndTime - entry.recvStartTime;

				// HTTP code
				entry.status = res.status || 200 /* for base64 data */;
				entry.statusText = HTTP_STATUS_CODES[entry.status];

				// parse URL
				var parsed = parseUrl(entry.url) || {};
				entry.domain = parsed.hostname;
				entry.protocol = parsed.protocol.replace(':', '');

				// asset type
				entry.type = 'other';

				// analyze HTTP headers
				res.headers.forEach(function(header) {
					switch (header.name) {
						// TODO: why it's not gzipped?
						// because: http://code.google.com/p/phantomjs/issues/detail?id=156
						case 'Content-Length':
							entry.contentLength = parseInt(header.value, 10);
							break;

						// detect content type
						case 'Content-Type':
							// parse header value
							var value = header.value.split(';').shift();

							switch(value) {
								case 'text/html':
									entry.type = 'html';
									break;

								case 'text/css':
									entry.type = 'css';
									break;

								case 'application/x-javascript':
								case 'text/javascript':
									entry.type = 'js';
									break;

								case 'image/png':
								case 'image/jpeg':
								case 'image/gif':
									entry.type = 'image';
									break;
							}

							// detect base64 encoded images
							if (entry.url.indexOf('data:') === 0) {
								entry.type = 'base64';
							}
							break;

						// detect content encoding
						case 'Content-Encoding':
							if (header.value === 'gzip') {
								entry.gzip = true;
							}
							break;
					}
				});

				// emit an event for other modules
				phantomas.emit('recv', entry, res);
				phantomas.log(entry);
				break;
		}
	});
};
