/**
 * Test redirects module
 */
var vows = require('vows'),
	assert = require('assert'),
	mock = require('./mock');

vows.describe('redirects').
	addBatch({
		'HTTP 301/302': mock.getContext('redirects', function(phantomas) {
			return phantomas.recv({isRedirect: true, headers: {}}).report();
		},
		{
			'redirects': 1
		}),
		'HTTP 200': mock.getContext('redirects', function(phantomas) {
			return phantomas.recv().report();
		},
		{
			'redirects': 0
		})
	}).
	export(module);
