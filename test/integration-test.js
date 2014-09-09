/**
 * Integration tests using server-start.sh script
 */
'use strict';

var vows = require('vows'),
	assert = require('assert'),
	fs = require('fs'),
	yaml = require('js-yaml'),
	phantomas = require('..');

// see start-server.sh
var WEBROOT = 'http://127.0.0.1:8888';

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
	var batch = {};

	batch[test.url] = {
		topic: function() {
			phantomas(WEBROOT + test.url, this.callback);
		},
		'phantomas run is succssful': function(err, data, results) {
			assert.equal(err, null);
		},
		'metrics should match the expected values': function(err, data, results) {
			Object.keys(test.metrics).forEach(function (name) {
				assert.equal(results.getMetric(name), test.metrics[name], name + ' should be = ' + test.metrics[name]);
			});
		},
	};

	suite.addBatch(batch);
});

suite.export(module);
