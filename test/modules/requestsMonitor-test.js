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

function recvContentType(contentType, url) {
	return recvReq(url, {
		headers: [{
			name: 'Content-Type',
			value: contentType
		}]
	});
}

function assertField(name, value) {
	return function(entry) {
		assert.strictEqual(entry[name], value);
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
	'content type is properly passed': {
		topic: recvContentType('text/html'),
		'entry.contentType is set': assertField('contentType', 'text/html')
	},
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
	},
	'WEBP image is properly detected': {
		topic: recvContentType('image/webp'),
		'isImage is set': assertField('isImage', true)
	},
	'WebM video is properly detected': {
		topic: recvContentType('video/webm'),
		'isVideo is set': assertField('isVideo', true)
	},
	'Web font is properly detected (via MIME)': {
		topic: recvContentType('application/font-woff'),
		'isWebFont is set': assertField('isWebFont', true)
	},
	'Web font is properly detected (via URL)': {
		topic: recvContentType('application/octet-stream', 'http://foo.bar/font.otf'),
		'isWebFont is set': assertField('isWebFont', true)
	}
}).addBatch({
	'redirects are detected (HTTP 301)': {
		topic: recvReq('', {
			status: 301
		}),
		'isRedirect field is set': assertField('isRedirect', true)
	},
	'redirects are detected (HTTP 302)': {
		topic: recvReq('', {
			status: 302
		}),
		'isRedirect field is set': assertField('isRedirect', true)
	},
	'redirects are detected (HTTP 303)': {
		topic: recvReq('', {
			status: 303
		}),
		'isRedirect field is set': assertField('isRedirect', true)
	},
	'redirects are detected (HTTP 200)': {
		topic: recvReq('', {
			status: 200
		}),
		'isRedirect field is not set': assertField('isRedirect', undefined)
	}
}).addBatch({
	'POST requests are detected': {
		topic: mock.initCoreModule('requestsMonitor').recvRequest({
			method: 'POST'
		}),
		'postRequests metric is set': mock.assertMetric('postRequests', 1)
	},
	'not found responses are detected (HTTP 404)': {
		topic: mock.initCoreModule('requestsMonitor').recvRequest({
			status: 404
		}),
		'notFound metric is set': mock.assertMetric('notFound', 1)
	},
	'GZIP responses are detected': {
		topic: recvReq(undefined, {
			headers: [{
				name: 'Content-Encoding',
				value: 'gzip'
			}]
		}),
		'gzip is set': assertField('gzip', true)
	}
}).export(module);
