/**
 * Analyzes HTTP requests and generates stats metrics
 */
exports.version = '0.2';

exports.module = function(phantomas) {
	var stack = {};

	// adds given entry under the "type" if given check function returns true
	function pushToStack(type, entry, check) {
		// no entry of given type
		if (typeof stack[type] === 'undefined') {
			stack[type] = entry;
		}
		// apply check function
		else if (check(stack[type], entry) === true) {
			stack[type] = entry;
		}
	}

	function getFromStack(type) {
		return stack[type];
	}

	var Stats = require('fast-stats').Stats,
		responseTimes = new Stats(),
		latencyTimes = new Stats();

	phantomas.on('recv', function(entry, res) {
		// ignore anything different than HTTP 200
		if (entry.status !== 200) {
			return;
		}

		// size
		pushToStack('smallestResponse', entry, function(stack, entry) {
			return stack.bodySize > entry.bodySize;
		});

		pushToStack('biggestResponse', entry, function(stack, entry) {
			return stack.bodySize < entry.bodySize;
		});

		// time (from sent to last byte)
		pushToStack('fastestResponse', entry, function(stack, entry) {
			return stack.timeToLastByte > entry.timeToLastByte;
		});

		pushToStack('slowestResponse', entry, function(stack, entry) {
			return stack.timeToLastByte < entry.timeToLastByte;
		});

		// latency
		pushToStack('smallestLatency', entry, function(stack, entry) {
			return stack.timeToFirstByte > entry.timeToFirstByte;
		});

		pushToStack('biggestLatency', entry, function(stack, entry) {
			return stack.timeToFirstByte < entry.timeToFirstByte;
		});

		// stats
		responseTimes.push(entry.timeToLastByte);
		latencyTimes.push(entry.timeToFirstByte);
	});

	phantomas.on('report', function() {
		var entries = Object.keys(stack).length;

		if (entries === 0) {
			phantomas.log('requestsStats: no requests data gathered!');
			return;
		}

		// TODO: iterate here...
		var smallestResponse = getFromStack('smallestResponse'),
			biggestResponse = getFromStack('biggestResponse'),
			fastestResponse = getFromStack('fastestResponse'),
			slowestResponse = getFromStack('slowestResponse'),
			smallestLatency = getFromStack('smallestLatency'),
			biggestLatency = getFromStack('biggestLatency');

		phantomas.setMetric('smallestResponse', smallestResponse.bodySize);
		phantomas.setMetric('biggestResponse', biggestResponse.bodySize);

		// TODO: use offenders (#140)
		phantomas.addNotice('The smallest response (' + (smallestResponse.bodySize/1024).toFixed(2) + ' kB): <' + smallestResponse.url + '>');
		phantomas.addNotice('The biggest response (' + (biggestResponse.bodySize/1024).toFixed(2) + ' kB): <' + biggestResponse.url + '>');

		phantomas.addNotice();

		phantomas.setMetric('fastestResponse', fastestResponse.timeToLastByte);
		phantomas.setMetric('slowestResponse', slowestResponse.timeToLastByte);

		// TODO: use offenders (#140)
		phantomas.addNotice('The fastest response (' + fastestResponse.timeToLastByte + ' ms): <' + fastestResponse.url + '>');
		phantomas.addNotice('The slowest response (' + slowestResponse.timeToLastByte + ' ms): <' + slowestResponse.url + '>');

		phantomas.addNotice();

		phantomas.setMetric('smallestLatency', smallestLatency.timeToFirstByte);
		phantomas.setMetric('biggestLatency', biggestLatency.timeToFirstByte);

		// TODO: use offenders (#140)
		phantomas.addNotice('The smallest latency (' + smallestLatency.timeToFirstByte + ' ms): <' + smallestLatency.url + '>');
		phantomas.addNotice('The biggest latency (' + biggestLatency.timeToFirstByte + ' ms): <' + biggestLatency.url + '>');

		phantomas.addNotice();

		phantomas.setMetric('medianResponse', responseTimes.median());
		phantomas.setMetric('medianLatency', latencyTimes.median());
	});
};
