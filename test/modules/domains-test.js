/**
 * Test domains module
 */
var vows = require('vows'),
	assert = require('assert'),
	mock = require('./mock');

vows.describe('domains').addBatch({
	'module': mock.getContext('domains', function(phantomas) {
		var domains = [];

		domains.push({name: 'example.com', cnt: 2});
		domains.push({name: 'awesome.cdn.com', cnt: 6});
		domains.push({name: 'ads.co.uk', cnt: 3});

		domains.forEach(function(domain) {
			for (var i=0; i<domain.cnt; i++) {
				phantomas.recv({
					domain: domain.name
				});
			}
		});

		// calculate metrics
		return phantomas.report();
	},
	{
		'domains': 3,
		'maxRequestsPerDomain': 6
	})
}).export(module);
