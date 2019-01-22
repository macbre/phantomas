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

var Stats = require('../../lib/fast-stats').Stats;

module.exports = function(phantomas) {
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

	phantomas.on('recv', entry => {
		// ignore anything different than HTTP 200
		if (entry.status !== 200) {
			return;
		}

		// size
		pushToStack('smallestResponse', entry, function(stack, entry) {
			return stack.responseSize > entry.responseSize;
		});

		pushToStack('biggestResponse', entry, function(stack, entry) {
			return stack.responseSize < entry.responseSize;
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
				offender = {
					url: entry.url,
				};

			switch (metric) {
				case 'smallestResponse':
				case 'biggestResponse':
					phantomas.setMetric(metric, entry.responseSize);
					offender.size = entry.responseSize; // [bytes]
					break;

				case 'fastestResponse':
				case 'slowestResponse':
					phantomas.setMetric(metric, entry.timeToLastByte);
					offender.timeToLastByte = entry.timeToLastByte; // [seconds]
					break;

				case 'smallestLatency':
				case 'biggestLatency':
					phantomas.setMetric(metric, entry.timeToFirstByte);
					offender.timeToFirstByte = entry.timeToFirstByte; // [seconds]
					break;
			}

			phantomas.addOffender(metric, offender);
		});

		phantomas.setMetric('medianResponse', responseTimes.median());
		phantomas.setMetric('medianLatency', latencyTimes.median());
	});
};
