/**
 * Integration tests using server-start.sh script
 */
'use strict';

var vows = require('vows'),
	assert = require('assert'),
	phantomas = require('..');

// see start-server.sh
var WEBROOT = 'http://127.0.0.1:8888';

// run the test
vows.describe('Integration tests').addBatch({
	'/dom.html': {
		topic: function() {
			phantomas(WEBROOT + '/dom.html', this.callback);
		},
		'metrics should match': function(err, data, results) {
			assert.equal(err, null);

			var metrics = {
				requests: 3,
				cssCount: 1,
				jsCount: 1,
				domains: 2,
				DOMqueries: 10,
				DOMqueriesById: 3,
				DOMqueriesByClassName: 1,
				DOMqueriesByTagName: 5,
				DOMqueriesByQuerySelectorAll: 1,
				DOMinserts: 2,
				DOMqueriesDuplicated: 3,
			};

			Object.keys(metrics).forEach(function(name) {
				assert.equal(results.getMetric(name), metrics[name], name + ' should be = ' + metrics[name]);
			});
		}
	},
}).export(module);
