/**
 * Tests results wrapper and asserts API
 */
var vows = require('vows'),
	assert = require('assert'),
	Results = require('../core/results');

var topic = function() {
	return new Results();
};

// run the test
vows.describe('Results wrapper').addBatch({
	'Metrics': {
		topic: topic,
		'should be correctly set': function(results) {
			results.setMetric('foo', 'bar');
			assert.strictEqual(results.getMetric('foo'), 'bar');
		},
		'should be correctly set (with no casting)': function(results) {
			results.setMetric('bar', null);
			assert.strictEqual(results.getMetric('bar'), null);
		},
		'should return the list of registered metrics': function(results) {
			assert.deepEqual(results.getMetricsNames(), ['foo', 'bar']);
		},
		'should return the list of metrics and their values': function(results) {
			assert.deepEqual(results.getMetrics(), {foo: 'bar', bar: null});
		},
	},
	'Offenders': {
		topic: topic,
		'should be registered': function(results) {
			results.addOffender('metric', 'foo');
			results.addOffender('metric', 'bar');
			results.addOffender('metric2', 'test');
		},
		'should be kept in order': function(results) {
			assert.deepEqual(results.getOffenders('metric'), ['foo', 'bar']);
			assert.deepEqual(results.getOffenders('metric2'), ['test']);

			assert.equal('undefined', typeof results.getOffenders('metric3'));
		}
	},
	'Notices': {
		topic: topic,
		'should be registered': function(results) {
			results.addNotice('foo');
			assert.deepEqual(results.getNotices(), ['foo']);
		},
		'should be kept in order': function(results) {
			results.addNotice('bar');
			assert.deepEqual(results.getNotices(), ['foo', 'bar']);
		},
		'should allow an empty entry': function(results) {
			results.addNotice('');
			assert.deepEqual(results.getNotices(), ['foo', 'bar', '']);
		}
	},
	'Asserts': {
		topic: topic,
		'should be correctly registered': function(results) {
			results.setAsserts({
				foo: 123,
				bar: 0
			});
			assert.deepEqual(results.getAsserts(), {foo: 123, bar: 0});

			assert.isTrue(results.hasAssertion('foo'));
			assert.isFalse(results.hasAssertion('test'));

			assert.equal(results.getAssertion('foo'), 123);
		},
		'should be correctly processed': function(results) {
			results.setMetric('foo', 123);
			assert.isTrue(results.assert('foo'), 'foo lte 123');

			results.setMetric('foo', 124);
			assert.isFalse(results.assert('foo'), 'foo is not lte 123');

			results.setMetric('test', 200);
			assert.isFalse(results.hasAssertion('test'), 'no assert for test metric');
			assert.isTrue(results.assert('test'), 'no assert for test metric');
		},
		'can be added on the fly': function(results) {
			results.setMetric('foo', 125);
			assert.isFalse(results.assert('foo'), 'foo is lte 123');

			results.setAssert('foo', 200);
			assert.isTrue(results.assert('foo'), 'foo is lte 200');
		},
		'should always be meet for non-numeric values': function(results) {
			results.setAssert('foo', 200);

			results.setMetric('foo', '1.9.2');
			assert.isTrue(results.assert('foo'), 'string assert');

			results.setMetric('foo', false);
			assert.isTrue(results.assert('foo'), 'bool assert');
		},
		'should be correctly reported': function(results) {
			results.setAsserts({
				foo: 123,
				bar: 0
			});

			results.setMetric('foo', 123);
			results.setMetric('bar', 0);
			assert.deepEqual(results.getFailedAsserts(), [], 'all asserts are meet');

			results.setMetric('foo', 124);
			results.setMetric('bar', 0);
			assert.deepEqual(results.getFailedAsserts(), ['foo'], 'one assert is not meet');

			results.setMetric('foo', 124);
			results.setMetric('bar', 1);
			assert.deepEqual(results.getFailedAsserts(), ['foo', 'bar'], 'two asserts are not meet');
		}
	}
}).export(module);
