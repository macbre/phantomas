/**
 * Tests CommonJS module
 */
'use strict';

var vows = require('vows'),
	assert = require('assert'),
	phantomas = require('..');

const URL = 'http://127.0.0.1:8888/';

// run the test
vows.describe('CommonJS module\'s promise').addBatch({
	'when not provided with URL': {
		topic: function() {
			const promise = phantomas(false);

			promise.
				then(res => this.callback(null, res)).
				catch(err => this.callback(null, err));
		},
		'should reject a promise': (_, err) => {
			assert.ok(err instanceof Error);
			assert.strictEqual(err.message, 'URL must be a string');
		}
	},
	/**'when timed out': {
		topic: function() {
			phantomas('http://phantomjs.org/', {
				timeout: 1
			}, this.callback);
		},
		'should fail with err #252': err => {
			assert.ok(err instanceof Error);
			assert.strictEqual(err.message, '252');
		}
	},**/
	'a valid URL': {
		topic: function() {
			const promise = phantomas(URL);

			promise.
				then(res => this.callback(null, res)).
				catch(err => this.callback(err));
		},
		'should be resolved': function(err, res) {
			assert.equal(typeof res.getMetrics, 'function');
			assert.equal(typeof res.setMetric, 'function');
		}
	}
}).export(module);
