/**
 * Test requestsMonitor core module
 */
var vows = require('vows'),
	assert = require('assert'),
	mock = require('./mock'),
	extend = require('util')._extend;

function sendReq(url, extra) {
	return function() {
		var phantomas = mock.initCoreModule('requestsMonitor'),
			ret = false;

		phantomas.on('recv', function(entry, _) {
			ret = entry;
		});
		phantomas.sendRequest(extend({
			url: url
		}, extra || {}));
		return ret;
	};
}

function sendContentType(contentType, url) {
	return sendReq(url, {
		headers: {'Content-Type': contentType}
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
		/**
		'beforeSend is fired': function(phantomas) {
			assert.isTrue(phantomas.emitted('beforeSend'));
		},
		**/
		'send is fired': function(phantomas) {
			assert.isTrue(phantomas.emitted('send'));
		}
	},
	/**
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
	**/
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
	/**
	'base64-encoded data is property detected': {
		topic: recvReq('data:image/png;base64,iVBORw0KGgoAAAA', {}, 'base64recv'),
		'protocol is not set': assertField('protocol', false),
		'domain is not set': assertField('domain', false),
		'isSSL is not set': assertField('isSSL', undefined),
		'isBase64 is set': assertField('isBase64', true)
	},
	**/
}).addBatch({
	'content type is properly passed': {
		topic: sendContentType('text/html'),
		'entry.contentType is set': assertField('contentType', 'text/html')
	},
	'HTML is properly detected': {
		topic: sendContentType('text/html'),
		'isHTML is set': assertField('isHTML', true)
	},
	'XML is properly detected': {
		topic: sendContentType('text/xml'),
		'isXML is set': assertField('isXML', true)
	},
	'CSS is properly detected': {
		topic: sendContentType('text/css'),
		'isCSS is set': assertField('isCSS', true)
	},
	'JS is properly detected': {
		topic: sendContentType('text/javascript'),
		'isJS is set': assertField('isJS', true)
	},
	'JSON is properly detected': {
		topic: sendContentType('application/json'),
		'isJSON is set': assertField('isJSON', true)
	},
	'PNG image is properly detected': {
		topic: sendContentType('image/png'),
		'isImage is set': assertField('isImage', true)
	},
	'JPEG image is properly detected': {
		topic: sendContentType('image/jpeg'),
		'isImage is set': assertField('isImage', true)
	},
	'GIF image is properly detected': {
		topic: sendContentType('image/gif'),
		'isImage is set': assertField('isImage', true)
	},
	'SVG image is properly detected': {
		topic: sendContentType('image/svg+xml'),
		'isImage is set': assertField('isImage', true),
		'isSVG is set': assertField('isSVG', true)
	},
	'WEBP image is properly detected': {
		topic: sendContentType('image/webp'),
		'isImage is set': assertField('isImage', true)
	},
	'WebM video is properly detected': {
		topic: sendContentType('video/webm'),
		'isVideo is set': assertField('isVideo', true)
	},
	'Web font is properly detected (via MIME)': {
		topic: sendContentType('application/font-woff'),
		'isWebFont is set': assertField('isWebFont', true),
		'isTTF is not set': assertField('isTTF', undefined)
	},
	'Web font is properly detected (via URL)': {
		topic: sendContentType('application/octet-stream', 'http://foo.bar/font.otf'),
		'isWebFont is set': assertField('isWebFont', true),
		'isTTF is not set': assertField('isTTF', undefined)
	},
	'TTF font is properly detected': {
		topic: sendContentType('application/x-font-ttf'),
		'isWebFont is set': assertField('isWebFont', true),
		'isTTF is set': assertField('isTTF', true)
	},
	'favicon is properly detected': {
		topic: sendContentType('image/x-icon'),
		'isFavicon is set': assertField('isFavicon', true)
	},
	'favicon is properly detected (Microsoft\'s MIME type)': {
		topic: sendContentType('image/vnd.microsoft.icon'),
		'isFavicon is set': assertField('isFavicon', true)
	},
}).addBatch({
	'redirects are detected (HTTP 301)': {
		topic: sendReq('', {
			status: 301
		}),
		'isRedirect field is set': assertField('isRedirect', true)
	},
	'redirects are detected (HTTP 302)': {
		topic: sendReq('', {
			status: 302
		}),
		'isRedirect field is set': assertField('isRedirect', true)
	},
	'redirects are detected (HTTP 303)': {
		topic: sendReq('', {
			status: 303
		}),
		'isRedirect field is set': assertField('isRedirect', true)
	},
	'redirects are detected (HTTP 200)': {
		topic: sendReq('', {
			status: 200
		}),
		'isRedirect field is not set': assertField('isRedirect', undefined)
	}
}).addBatch({
	'POST requests are detected': {
		topic: mock.initCoreModule('requestsMonitor').sendRequest({
			method: 'POST'
		}),
		'postRequests metric is set': mock.assertMetric('postRequests', 1)
	},
	'not found responses are detected (HTTP 404)': {
		topic: mock.initCoreModule('requestsMonitor').sendRequest({
			status: 404
		}),
		'notFound metric is set': mock.assertMetric('notFound', 1)
	},
	'GZIP responses are detected': {
		topic: sendReq(undefined, {
			headers: {'Content-Encoding': 'gzip'}
		}),
		'gzip is set': assertField('gzip', true)
	}
}).export(module);
