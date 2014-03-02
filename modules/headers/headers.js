/**
 * Analyzes HTTP headers in both requests and responses
 */
exports.version = '0.1';

exports.module = function(phantomas) {
	phantomas.setMetric('headersCount'); // @desc number of requests and responses headers
	phantomas.setMetric('headersSentCount'); // @desc number of headers sent in requests
	phantomas.setMetric('headersRecvCount'); // @desc number of headers received in responses

	phantomas.setMetric('headersSize'); // @desc size of all headers
	phantomas.setMetric('headersSentSize'); // @desc size of sent headers
	phantomas.setMetric('headersRecvSize'); // @desc size of received headers

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
		var data = processHeaders(res.headers);

		phantomas.incrMetric('headersCount', data.count);
		phantomas.incrMetric('headersSize', data.size);

		phantomas.incrMetric('headersSentCount', data.count);
		phantomas.incrMetric('headersSentSize', data.size);
	});
		
	phantomas.on('recv', function(entry, res) {
		var data = processHeaders(res.headers);

		phantomas.incrMetric('headersCount', data.count);
		phantomas.incrMetric('headersSize', data.size);

		phantomas.incrMetric('headersRecvCount', data.count);
		phantomas.incrMetric('headersRecvSize', data.size);
	});
};
