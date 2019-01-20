/**
 * Test redirects module
 */
const vows = require('vows'),
	mock = require('./mock');

vows.describe('redirects').
addBatch({
	'HTTP 301/302': mock.getContext('redirects', function(phantomas) {
		return phantomas.recv({
			isRedirect: true,
			timeToLastByte: 20,
			headers: {}
		}).report();
	}, {
		'redirects': 1,
		'redirectsTime': 20
	}),
	'HTTP 200': mock.getContext('redirects', function(phantomas) {
		return phantomas.recv().report();
	}, {
		'redirects': 0,
		'redirectsTime': 0
	})
}).
export(module);
