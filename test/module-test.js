/**
 * Tests CommonJS module
 */
'use strict';

var vows = require('vows'),
	assert = require('assert'),
	phantomas = require('..');

// run the test
vows.describe('CommonJS module').addBatch({
	'when not provided with URL': {
		topic: function() {
			phantomas(false, this.callback);
		},
		'should fail with err #255': function(err, stats) {
			assert.equal(err, 255);
		}
	},
	'when timed out': {
		topic: function() {
			phantomas('http://phantomjs.org/', {
				timeout: 1
			}, this.callback);
		},
		'should fail with err #252': function(err, stats) {
			assert.equal(err, 252);
		}
	},
	'for a valid URL': {
		topic: function() {
			phantomas('http://example.com/', this.callback);
		},
		'should not throw an error': function(err, stats) {
			assert.strictEqual(err, null);
		},
		'should return metrics and other stats': function(err, stats) {
			assert.equal(stats.url, 'http://example.com/');
			assert.equal(typeof stats.generator, 'string');
			assert.equal(typeof stats.metrics, 'object');
			assert.equal(typeof stats.offenders, 'object');
		}
	},
	'promise': {
		topic: function() {
			phantomas('http://example.com/').then(function(res) {
				this.callback(null, res);
			}.bind(this));
		},
		'should be resolved': function(err, res) {
			assert.equal(typeof res, 'object');
			assert.equal(typeof res.code, 'number');
			assert.equal(typeof res.results, 'object');
			assert.equal(typeof res.json, 'object');
		}
	}
}).export(module);
