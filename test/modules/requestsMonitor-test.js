/**
 * Test requestsMonitor core module
 */

var vows = require('vows'),
	assert = require('assert'),
	mock = require('./mock');

vows.describe('requestMonitor').addBatch({
	'events on send are fired': {
		topic: function() {
			var phantomas = mock.initCoreModule('requestsMonitor');
			phantomas.sendRequest();
			return phantomas;
		},
		'beforeSend is fired': function(phantomas) {
			assert.isTrue(phantomas.emitted('beforeSend'));
		},
		'send is fired': function(phantomas) {
			assert.isTrue(phantomas.emitted('send'));
		}
	},
	'URLs are properly parsed when sent': {
		topic: function() {
			var phantomas = mock.initCoreModule('requestsMonitor'),
				ret;

			phantomas.on('send', function(entry, res) {
				ret = entry;
			});
			phantomas.sendRequest({
				url: 'http://example.com/foo?bar=test&a=b'
			});
			return ret;
		},
		'protocol is set': function(entry) {
			assert.equal(entry.protocol, 'http');
		},
		'domain is set': function(entry) {
			assert.equal(entry.domain, 'example.com');
		},
		'query is set': function(entry) {
			assert.equal(entry.query, 'bar=test&a=b');
		},
		'isSSL is not set': function(entry) {
			assert.isTrue(!entry.isSSL);
		},
		'isBase64 is not set': function(entry) {
			assert.isTrue(!entry.isBase64);
		}
	},
}).export(module);
