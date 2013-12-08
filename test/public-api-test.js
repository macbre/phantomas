/**
 * Tests public phantomas API
 */
var vows = require('vows'),
	assert = require('assert'),
	mockery = require('mockery'),
	phantomas = require('../core/phantomas');

// mock PhantomJS-specific modules and globals
GLOBAL.phantom = {
	version: {}
};
mockery.registerMock('fs', {
	list: function() {}
});
mockery.registerMock('system', {
	os: {}
});
mockery.registerMock('webpage', {
	create: function() {
		return {
			evaluate: function() {},
			injectJs: function() {},
			render: function() {}
		};
	},
});
mockery.enable({
	warnOnUnregistered: false
});

// helper
function getPhantomasAPI(params) {
	var instance = new phantomas(params || {});
	return instance.getPublicWrapper();
}

// run the test
vows.describe('phantomas public API').addBatch({
	'exposes values and methods': {
		topic: function() {
			return getPhantomasAPI({
				url: 'http://example.com'
			});
		},
		'url field is set correctly': function(api) {
			assert.equal(api.url, 'http://example.com');
		},
		'methods are accessible': function(api) {
			var methods = [
				'getParam',
				'on',
				'once',
				'emit',
				'setMetric',
				'setMetricEvaluate',
				'setMetricFromScope',
				'setMarkerMetric',
				'getFromScope',
				'incrMetric',
				'getMetric',
				'addOffender',
				'addNotice',
				'log',
				'echo',
				'evaluate',
				'injectJs',
				'require'
			];

			methods.forEach(function(method) {
				assert.equal(typeof api[method], 'function');
			});
		}
	},
	'events are processed': {
		topic: getPhantomasAPI,
		'event is triggered': function(api) {
			var triggered;

			api.on('foo', function() {
				triggered = true;
			});
			api.emit('foo');

			assert.isTrue(triggered);
		},
		'params are passed': function(api) {
			var a, b;

			api.on('foo', function(valA, valB) {
				a = valA;
				b = valB;
			});
			api.emit('foo', 123, 456);

			assert.equal(a, 123);
			assert.equal(b, 456);
		}
	},
	'metrics': {
		topic: getPhantomasAPI,
		'have default value': function(api) {
			assert.equal(typeof api.getMetric('undef'), 'undefined');
		},
		'are set': function(api) {
			api.setMetric('foo', 123);
			assert.equal(api.getMetric('foo'), 123);
		},
		'are set with default value': function(api) {
			api.setMetric('foo');
			assert.strictEqual(api.getMetric('foo'), 0);
		},
		'treat "undefined" value as 0': function(api) {
			api.setMetric('foo', undefined);
			assert.strictEqual(api.getMetric('foo'), 0);
		},
		'treat "null" value as 0': function(api) {
			api.setMetric('foo', null);
			assert.strictEqual(api.getMetric('foo'), 0);
		},
		'treat empty string as empty string': function(api) {
			api.setMetric('foo', '');
			assert.strictEqual(api.getMetric('foo'), '');
		},
		'are properly incremented': function(api) {
			api.incrMetric('bar');
			assert.equal(api.getMetric('bar'), 1);

			api.incrMetric('bar', 3);
			assert.equal(api.getMetric('bar'), 4);
		},
		'marker is properly calculated': function(api) {
			var origDateNow = Date.now,
				now = Date.now(),
				diff = 5;

			// emit fake responseEnd event
			Date.now = function() { return now - diff; };
			api.emit('responseEnd');

			// set the marker
			Date.now = function() { return now; };
			api.setMarkerMetric('marker');

			assert.equal(api.getMetric('marker'), diff);

			// tearDown
			Date.now = origDateNow;
		},
	},
	'parameters': {
		topic: function() {
			return getPhantomasAPI({
				foo: 123,
				bar: 'abc'
			});
		},
		'params are accessible': function(api) {
			assert.equal(api.getParam('foo'), 123);
			assert.equal(api.getParam('bar'), 'abc');
		},
	}
}).export(module);
