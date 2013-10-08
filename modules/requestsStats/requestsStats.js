/**
 * Analyzes HTTP requests and generates stats metrics
 */
exports.version = '0.1';

exports.module = function(phantomas) {
	var smallestResponse,
		biggestResponse,
		fastestResponse,
		slowestResponse;

	var responseTimes = [];

	phantomas.on('recv', function(entry, res) {
		// ignore anything different than HTTP 200
		if (entry.status !== 200) {
			return;
		}

		// size
		if (!smallestResponse || smallestResponse.bodySize > entry.bodySize) {
			smallestResponse = entry;
		}

		if (!biggestResponse || biggestResponse.bodySize < entry.bodySize) {
			biggestResponse = entry;
		}

		// time
		if (!fastestResponse || fastestResponse.timeToLastByte > entry.timeToLastByte) {
			fastestResponse = entry;
		}

		if (!slowestResponse || slowestResponse.timeToLastByte < entry.timeToLastByte) {
			slowestResponse = entry;
		}

		// store time to calculate median response time
		responseTimes.push(entry.timeToLastByte);
	});

	phantomas.on('report', function() {
		if (!smallestResponse || !biggestResponse || !fastestResponse || !slowestResponse) {
			phantomas.log('requestsStats: no requests data gathered!');
			return;
		}

		phantomas.setMetric('smallestResponse', smallestResponse.bodySize);
		phantomas.setMetric('biggestResponse', biggestResponse.bodySize);

		phantomas.addNotice('The smallest response (' + (smallestResponse.bodySize/1024).toFixed(2) + ' kB): <' + smallestResponse.url + '>');
		phantomas.addNotice('The biggest response (' + (biggestResponse.bodySize/1024).toFixed(2) + ' kB): <' + biggestResponse.url + '>');

		phantomas.addNotice();

		phantomas.setMetric('fastestResponse', fastestResponse.timeToLastByte);
		phantomas.setMetric('slowestResponse', slowestResponse.timeToLastByte);

		phantomas.addNotice('The fastest response (' + fastestResponse.timeToLastByte + ' ms): <' + fastestResponse.url + '>');
		phantomas.addNotice('The slowest response (' + slowestResponse.timeToLastByte + ' ms): <' + slowestResponse.url + '>');

		phantomas.addNotice();

		phantomas.setMetric('medianResponse', phantomas.median(responseTimes));
	});
};
