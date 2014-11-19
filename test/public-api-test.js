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
	os: {},
	stdout: {
		writeLine: function() {}
	}
});
mockery.registerMock('webpage', {
	create: function() {
		return {
			evaluate: function() {},
			injectJs: function() {},
			render: function() {},
			content: '<html></html>'
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
		'version is exposed via getVersion': function(api) {
			assert.equal(api.getVersion(), require(__dirname + '/../package').version);
		},
		'methods are accessible': function(api) {
			var methods = [
				'getVersion',
				'getParam',
				'setParam',
				'on',
				'once',
				'emit',
				'emitInternal',
				'setMetric',
				'setMetricEvaluate',
				'setMarkerMetric',
				'incrMetric',
				'getMetric',
				'addOffender',
				'log',
				'echo',
				'evaluate',
				'injectJs',
				'require',
				'getSource'
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
			Date.now = function() {
				return now - diff;
			};
			api.emit('responseEnd');

			// set the marker
			Date.now = function() {
				return now;
			};
			api.setMarkerMetric('marker');

			assert.equal(api.getMetric('marker'), diff);

			// tearDown
			Date.now = origDateNow;
		},
		'metric is correctly increased': function(results) {
			results.setMetric('bar', 0);

			// default value = 1
			results.incrMetric('bar');
			assert.strictEqual(results.getMetric('bar'), 1);

			// no increase
			results.incrMetric('bar', 0);
			assert.strictEqual(results.getMetric('bar'), 1);

			results.incrMetric('bar', 41);
			assert.strictEqual(results.getMetric('bar'), 42);
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
			assert.strictEqual(api.getParam('foo'), 123);
			assert.strictEqual(api.getParam('bar'), 'abc');
		},
		'getParam() handles the default value': function(api) {
			assert.strictEqual(api.getParam('test', 123), 123);
			assert.strictEqual(api.getParam('test'), undefined);
		},
		'getParam() handles strict type check': function(api) {
			assert.strictEqual(api.getParam('foo', 'default', 'number'), 123);
			assert.strictEqual(api.getParam('foo', 'default', 'string'), 'default');
		},
		'parameters can be altered': function(api) {
			api.setParam('foo', 124);
			api.setParam('test', true);

			assert.strictEqual(api.getParam('foo'), 124);
			assert.strictEqual(api.getParam('test'), true);
		},
	},
	'page source': {
		topic: getPhantomasAPI,
		'getSource() return the page source': function(api) {
			assert.equal(api.getSource(), '<html></html>');
		}
	}
}).export(module);
