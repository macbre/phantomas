/**
 * Integration tests using server-start.sh script
 */
'use strict';

var vows = require('vows'),
	assert = require('assert'),
	fs = require('fs'),
	yaml = require('js-yaml'),
	phantomas = require('..');

var WEBROOT = 'http://127.0.0.1:8888'; // see start-server.sh

// run the test
var suite = vows.describe('Integration tests').addBatch({
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
		batchName = test.label || test.url;

	batch[batchName] = {
		topic: function() {
			phantomas(WEBROOT + test.url, test.options || {}).
				then(res => this.callback(null, res)).
				catch(err => this.callback(err));
		},
		'should be generated': (err, res) => {
			if (test.exitCode) {
				assert.ok(err instanceof Error);
			} else {
				assert.equal(err, null, 'No error should be thrown');
				assert.ok(res.getMetric instanceof Function, 'Results wrapper should be passed');
			}
		},
	};

	// check metrics
	Object.keys(test.metrics || {}).forEach(function(name) {
		batch[batchName]['should have "' + name + '" metric properly set'] = function(err, results) {
			assert.ok(!(err instanceof Error), 'Error should not be thrown: ' + err);
			assert.strictEqual(results.getMetric(name), test.metrics[name]);
		};
	});

	// check offenders
	Object.keys(test.offenders || {}).forEach(function(name) {
		batch[batchName]['should have "' + name + '" offender(s) properly set'] = function(err, results) {
			assert.ok(!(err instanceof Error), 'Error should not be thrown: ' + err);
			assert.deepStrictEqual(results.getOffenders(name), test.offenders[name]);
		};
	});


	suite.addBatch(batch);
});

suite.export(module);
