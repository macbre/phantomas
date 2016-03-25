/**
 * Integration tests using server-start.sh script
 */
'use strict';

var vows = require('vows'),
	assert = require('assert'),
	fs = require('fs'),
	yaml = require('js-yaml'),
	phantomas = require('..');

var WEBROOT = 'http://127.0.0.1:8888', // see start-server.sh
	ENGINE = process.env.PHANTOMAS_ENGINE; // currently used engine (either PhantomJS or SlimerJS)

// run the test
var suite = vows.describe('Integration tests - ' + ENGINE).addBatch({
	'test server': {
		topic: function() {
			var http = require('http'),
				self = this;

			http.get(WEBROOT + '/', function(res) {
				self.callback(null, res);
			}).on('error', self.callback);
		},
		'should be up and running': function(err, res) {
			assert.equal(typeof res !== 'undefined', true, 'responses to the request');
			assert.equal(res.statusCode, 200, 'responses with HTTP 200');
		}
	}
});

// register tests from spec file
var raw = fs.readFileSync(__dirname + '/integration-spec.yaml').toString(),
	spec = yaml.safeLoad(raw);

spec.forEach(function(test) {
	var batch = {},
		batchName = test.label || test.url,
		shouldSkip = test.skip && (test.skip === ENGINE);

	if (shouldSkip) {
		batch[batchName] = {
			topic: 'foo',
			'should be skipped': function() {}
		};
	} else {
		batch[batchName] = {
			topic: function() {
				phantomas(WEBROOT + test.url, test.options || {}, this.callback);
			},
			'should be generated': function(err, data, results) {
				if (test.exitCode) {
					assert.ok(err instanceof Error);
					assert.strictEqual(err.message, test.exitCode.toString(), 'Exit code matches the expected value');
				} else {
					assert.equal(err, null, 'Exit code matches the expected value');
				}
			},
		};

		Object.keys(test.metrics || {}).forEach(function(name) {
			batch[batchName]['should have "' + name + '" metric properly set'] = function(err, data, results) {
				assert.strictEqual(results.getMetric(name), test.metrics[name]);
			};
		});
	}

	suite.addBatch(batch);
});

suite.export(module);
