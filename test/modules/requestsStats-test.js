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
				bodySize: 25,
				timeToLastByte: 5,
			},
			{
				bodySize: 250,
				timeToLastByte: 1,
			},
			{
				bodySize: 2245,
				timeToLastByte: 11,
			},
			{
				bodySize: 205,
				timeToLastByte: 2,
			}
		];

		requests.forEach(phantomas.recvRequest, phantomas);

		// calculate metrics
		return phantomas.report();
	},
	{
		'smallestResponse': 25,
		'biggestResponse': 2245,
		'fastestResponse': 1,
		'slowestResponse': 11,
	})
}).export(module);
