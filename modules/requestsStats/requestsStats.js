/**
 * Analyzes HTTP requests and generates stats metrics
 */
exports.version = '0.3';

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

		// set metrics and provide offenders with URLs
		[
			'smallestResponse',
			'biggestResponse',
			'fastestResponse',
			'slowestResponse',
			'smallestLatency',
			'biggestLatency'
		].forEach(function(metric) {
			var entry = getFromStack(metric),
				details = '';

			switch (metric) {
				case 'smallestResponse':
				case 'biggestResponse':
					phantomas.setMetric(metric, entry.bodySize);
					details = (entry.bodySize/1024).toFixed(2) + ' kB';
					break;

				case 'fastestResponse':
				case 'slowestResponse':
					phantomas.setMetric(metric, entry.timeToLastByte);
					details = entry.timeToLastByte + ' ms';
					break;

				case 'smallestLatency':
				case 'biggestLatency':
					phantomas.setMetric(metric, entry.timeToFirstByte);
					details = entry.timeToFirstByte + ' ms';
					break;
			}

			phantomas.addOffender(metric, entry.url + ' (' + details + ')');
		});

		phantomas.setMetric('medianResponse', responseTimes.median());
		phantomas.setMetric('medianLatency', latencyTimes.median());
	});
};
