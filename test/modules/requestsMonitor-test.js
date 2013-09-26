/**
 * Test requestsMonitor core module
 */
var vows = require('vows'),
	assert = require('assert'),
	mock = require('./mock');

function sendReq(url) {
	return function() {
		var phantomas = mock.initCoreModule('requestsMonitor'),
			ret = false;

		phantomas.on('send', function(entry, res) {
			ret = entry;
		});
		phantomas.sendRequest({
			url: url
		});
		return ret;
	};
}

function recvReq(url, req, ev) {
	req = req || {};
	req.url = req.url || url;

	return function() {
		var phantomas = mock.initCoreModule('requestsMonitor'),
			ret = false;

		phantomas.on(ev || 'recv', function(entry, res) {
			ret = entry;
		});
		phantomas.recvRequest(req);
		return ret;
	};
}

function recvContentType(contentType) {
	return recvReq(undefined, {
		headers: [{
			name: 'Content-Type',
			value: contentType
		}]
	});
}

function assertField(name, value) {
	return function(entry) {
		assert.equal(entry[name], value);
	};
}

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
	'request can be aborted': {
		topic: function() {
			var phantomas = mock.initCoreModule('requestsMonitor');
			phantomas.on('beforeSend', function(entry, res) {
				entry.block();
			});
			phantomas.sendRequest();
			return phantomas;
		},
		'beforeSend is fired': function(phantomas) {
			assert.isTrue(phantomas.emitted('beforeSend'));
		},
		'send is not fired': function(phantomas) {
			assert.isFalse(phantomas.emitted('send'));
		}
	},
	'URLs are properly parsed when sent': {
		topic: sendReq('http://example.com/foo?bar=test&a=b'),
		'protocol is set': assertField('protocol', 'http'),
		'domain is set': assertField('domain', 'example.com'),
		'query is set': assertField('query', 'bar=test&a=b'),
		'isSSL is not set': assertField('isSSL', undefined),
		'isBase64 is not set': assertField('isBase64', undefined)
	},
	'HTTPS is property detected': {
		topic: sendReq('https://example.com/foo?bar=test&a=b'),
		'protocol is set': assertField('protocol', 'https'),
		'isSSL is set': assertField('isSSL', true)
	},
	'base64-encoded data is property detected': {
		topic: recvReq('data:image/png;base64,iVBORw0KGgoAAAA', {}, 'base64recv'),
		'protocol is not set': assertField('protocol', false),
		'domain is not set': assertField('domain', false),
		'isSSL is not set': assertField('isSSL', undefined),
		'isBase64 is set': assertField('isBase64', true)
	},
}).addBatch({
	'HTML is properly detected': {
		topic: recvContentType('text/html'),
		'isHTML is set': assertField('isHTML', true)
	},
	'CSS is properly detected': {
		topic: recvContentType('text/css'),
		'isCSS is set': assertField('isCSS', true)
	},
	'JS is properly detected': {
		topic: recvContentType('text/javascript'),
		'isJS is set': assertField('isJS', true)
	},
	'JSON is properly detected': {
		topic: recvContentType('application/json'),
		'isJSON is set': assertField('isJSON', true)
	},
	'PNG image is properly detected': {
		topic: recvContentType('image/png'),
		'isImage is set': assertField('isImage', true)
	},
	'JPEG image is properly detected': {
		topic: recvContentType('image/jpeg'),
		'isImage is set': assertField('isImage', true)
	},
	'GIF image is properly detected': {
		topic: recvContentType('image/gif'),
		'isImage is set': assertField('isImage', true)
	},
	'SVG image is properly detected': {
		topic: recvContentType('image/svg+xml'),
		'isImage is set': assertField('isImage', true)
	}
}).addBatch({
	'POST requests are detected': {
		topic: mock.initCoreModule('requestsMonitor').recvRequest({method: 'POST'}),
		'postRequests metric is set': mock.assertMetric('postRequests')
	},
	'redirects are detected (HTTP 301)': {
		topic: mock.initCoreModule('requestsMonitor').recvRequest({status: 301}),
		'redirects metric is set': mock.assertMetric('redirects')
	},
	'redirects are detected (HTTP 302)': {
		topic: mock.initCoreModule('requestsMonitor').recvRequest({status: 302}),
		'redirects metric is set': mock.assertMetric('redirects')
	},
	'not found responses are detected (HTTP 404)': {
		topic: mock.initCoreModule('requestsMonitor').recvRequest({status: 404}),
		'notFound metric is set': mock.assertMetric('notFound')
	},
	'GZIP responses are detected': {
		topic: recvReq(undefined, {headers: [{name: 'Content-Encoding', value: 'gzip'}]}),
		'gzip is set': assertField('gzip', true)
	}
}).export(module);
