/**
 * Tests mainRequest module
 */
const vows = require('vows'),
	mock = require('./mock');

vows.describe('mainRequest').
addBatch({
	'redirect request': mock.getContext('mainRequest', function(phantomas) {
		return phantomas.
		recv({}, {
			status: 301
		}).
		responseEnd({}, {
			status: 200
		}).
		report();
	}, {
		'statusCodesTrail': '301,200'
	}),
	'long redirect request': mock.getContext('mainRequest', function(phantomas) {
		return phantomas.
		recv({}, {
			status: 301
		}).
		recv({}, {
			status: 302
		}).
		responseEnd({}, {
			status: 404
		}).
		report();
	}, {
		'statusCodesTrail': '301,302,404'
	}),
	'non-redirect (e.g. terminal) first request': mock.getContext('mainRequest', function(phantomas) {
		return phantomas.
		responseEnd({}, {
			status: 200
		}).
		report();
	}, {
		'statusCodesTrail': '200'
	}),
	'multiple requests': mock.getContext('mainRequest', function(phantomas) {
		return phantomas.
		responseEnd({}, {
			status: 200
		}).
		recv({}, {
			status: 404
		}).
		report();
	}, {
		'statusCodesTrail': '200'
	})
}).
export(module);
