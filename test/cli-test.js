/**
 * Tests CommonJS module
 */
'use strict';

var vows = require('vows'),
	assert = require('assert'),
	debug = require('debug')('phantomas:test'),
	exec = require('child_process').exec,
	phantomas = require('..');

function runPhantomasCLI(url, opts, callback) {
	var cmd = __dirname + '/../bin/phantomas.js ' + url + ' ' + opts;
	debug(cmd);

	exec(cmd, callback);
}

// run the test
vows.describe('CLI command').addBatch({
	'should pass error code with loading error': {
		topic: function() {
			runPhantomasCLI('http://foo.bar.test', '', this.callback);
		},
		'should fail with err #254': function(err, stdout) {
			assert.ok(err instanceof Error);
			assert.strictEqual(err.code, 254);
		}
	},
	'should pass error code when assert fails': {
		topic: function() {
			runPhantomasCLI('http://example.com', '--assert-requests=0', this.callback);
		},
		'should fail with err #1': function(err, stdout) {
			assert.ok(err instanceof Error);
			assert.strictEqual(err.code, 1);
		}
	}
}).export(module);
