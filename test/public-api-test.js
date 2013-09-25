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
	create: function() {}
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
				'getFromScope',
				'incrMetric',
				'getMetric',
				'addNotice',
				'log',
				'echo',
				'evaluate',
				'injectJs',
				'require',
				'getPageContent',
				'median'
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
	}
}).export(module);
