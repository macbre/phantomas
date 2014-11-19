/**
 * Analyzes HTTP requests and generates stats metrics
 *
 * setMetric('smallestResponse') @desc the size of the smallest response @offenders
 * setMetric('biggestResponse') @desc the size of the biggest response @offenders
 * setMetric('fastestResponse') @desc the time to the last byte of the fastest response @offenders
 * setMetric('slowestResponse') @desc the time to the last byte of the slowest response @offenders
 * setMetric('smallestLatency') @desc the time to the first byte of the fastest response @offenders
 * setMetric('biggestLatency') @desc the time to the first byte of the slowest response @offenders
 * setMetric('medianResponse') @desc median value of time to the last byte for all responses @offenders
 * setMetric('medianLatency') @desc median value of time to the first byte for all responses @offenders
 */
'use strict';

exports.version = '0.3';

var Stats = require('../../lib/fast-stats').Stats;

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

	var responseTimes = new Stats(),
		latencyTimes = new Stats();

	phantomas.on('recv', function(entry, res) {
		// ignore anything different than HTTP 200
		if (entry.status !== 200) {
			return;
		}

		// size
		pushToStack('smallestResponse', entry, function(stack, entry) {
			return stack.contentLength > entry.contentLength;
		});

		pushToStack('biggestResponse', entry, function(stack, entry) {
			return stack.contentLength < entry.contentLength;
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
					phantomas.setMetric(metric, entry.contentLength);
					details = (entry.contentLength / 1024).toFixed(2) + ' kB';
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
