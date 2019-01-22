/**
 * Analyzes HTTP headers in both requests and responses
 */
'use strict';

module.exports = function(phantomas) {
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
			Object.keys(headers).forEach(function(key) {
				res.count++;
				res.size += (key + ': ' + headers[key] + '\r\n').length;
			});
		}

		return res;
	}

	phantomas.on('request', function(entry) {
		var headers = processHeaders(entry.headers);

		phantomas.incrMetric('headersCount', headers.count);
		phantomas.incrMetric('headersSize', headers.size);

		phantomas.incrMetric('headersSentCount', headers.count);
		phantomas.incrMetric('headersSentSize', headers.size);
	});

	phantomas.on('recv', function(entry) {
		var headers = processHeaders(entry.headers);

		// phantomas.log('Headers: <%s> %d bytes', entry.url, headers.size);

		phantomas.incrMetric('headersCount', headers.count);
		phantomas.incrMetric('headersSize', entry.headersSize);

		phantomas.incrMetric('headersRecvCount', headers.count);
		phantomas.incrMetric('headersRecvSize', entry.headersSize);

		// skip HTTP 204 No Content responses
		if ((entry.status !== 204) && (headers.size > entry.transferedSize)) {
			phantomas.incrMetric('headersBiggerThanContent');
			phantomas.addOffender('headersBiggerThanContent', {url: entry.url, contentSize: entry.transferedSize, headersSize: entry.headersSize});
		}
	});
};
