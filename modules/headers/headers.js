/**
 * Analyzes HTTP headers in both requests and responses
 */
'use strict';

exports.version = '0.1';

exports.module = function(phantomas) {
	phantomas.setMetric('headersCount'); // @desc number of requests and responses headers
	phantomas.setMetric('headersSentCount'); // @desc number of headers sent in requests
	phantomas.setMetric('headersRecvCount'); // @desc number of headers received in responses

	phantomas.setMetric('headersSize'); // @desc size of all headers
	phantomas.setMetric('headersSentSize'); // @desc size of sent headers
	phantomas.setMetric('headersRecvSize'); // @desc size of received headers

	phantomas.setMetric('headersBiggerThanContent'); // @desc number of responses with headers part bigger than the response body

	function processHeaders(headers) {
		var res = {
			count: 0,
			size: 0
		};

		if (headers) {
			headers.forEach(function(header) {
				res.count++;
				res.size += (header.name + ': ' + header.value + '\r\n').length;
			});
		}

		return res;
	}

	phantomas.on('send', function(entry, res) {
		var headers = processHeaders(res.headers);

		phantomas.incrMetric('headersCount', headers.count);
		phantomas.incrMetric('headersSize', headers.size);

		phantomas.incrMetric('headersSentCount', headers.count);
		phantomas.incrMetric('headersSentSize', headers.size);
	});

	phantomas.on('recv', function(entry, res) {
		var headers = processHeaders(res.headers);

		phantomas.incrMetric('headersCount', headers.count);
		phantomas.incrMetric('headersSize', headers.size);

		phantomas.incrMetric('headersRecvCount', headers.count);
		phantomas.incrMetric('headersRecvSize', headers.size);

		// skip HTTP 204 No Content responses
		if ((entry.status !== 204) && (headers.size > entry.contentLength)) {
			phantomas.incrMetric('headersBiggerThanContent');
			phantomas.addOffender('headersBiggerThanContent', '%s (body: %s kB / headers: %s kB)', entry.url, (entry.contentLength / 1024).toFixed(2), (headers.size / 1024).toFixed(2));
		}
	});
};
