/**
 * Tests CommonJS module
 */
'use strict';

var vows = require('vows'),
	assert = require('assert'),
	phantomas = require('..');

const URL = 'http://127.0.0.1:8888/';

// run the test
vows.describe('CommonJS module').addBatch({
	/**'when not provided with URL': {
		topic: function() {
			phantomas(false, this.callback);
		},
		'should fail with err #255': err => {
			assert.ok(err instanceof Error);
			assert.strictEqual(err.message, '255');
		}
	},
	'when timed out': {
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
	'promise': {
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
	},
	/**
	'promise (when timed out)': {
		topic: function() {
			phantomas('http://phantomjs.org/', {
				timeout: 1
			}).then(
				function() {},
				function(res) {
					this.callback(null, res.code);
				}.bind(this)
			);
		},
		'should fail': function(err, code) {
			assert.strictEqual(code, 252);
		}
	}
	/**/
}).export(module);
