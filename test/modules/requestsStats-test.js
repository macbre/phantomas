/**
 * Test requestsStats core module
 */
var vows = require('vows'),
	assert = require('assert'),
	mock = require('./mock');

vows.describe('requestsStats').addBatch({
	'module': mock.getContext('requestsStats', function(phantomas) {
		var requests = [
			{
				status: 200,
				bodySize: 25,
				timeToFirstByte: 3,
				timeToLastByte: 5,
			},
			{
				status: 200,
				bodySize: 2245,
				timeToFirstByte: 1,
				timeToLastByte: 11,
			},
			{
				status: 200,
				bodySize: 205,
				timeToFirstByte: 2,
				timeToLastByte: 2,
			}
		];

		requests.forEach(phantomas.recv, phantomas);

		// calculate metrics
		return phantomas.report();
	},
	{
		'smallestResponse': 25,
		'biggestResponse': 2245,
		'fastestResponse': 2,
		'slowestResponse': 11,
		'smallestLatency': 1,
		'biggestLatency': 3,
		'medianResponse': 5,
		'medianLatency': 2
	})
}).export(module);
