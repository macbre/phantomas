/**
 * Simple results wrapper
 *
 * Will be passed via events and to formatters
 */
module.exports = function() {
	var asserts = {},
		generator = '',
		metrics = {},
		offenders = {},
		notices = [],
		url;

	// public API
	return {
		// notices
		addNotice: function(msg) {
			notices.push(msg);
		},
		getNotices: function() {
			return notices;
		},

		// metrics
		setMetric: function(name, value) {
			metrics[name] = value;
		},
		getMetric: function(name) {
			return metrics[name];
		},
		getMetrics: function() {
			return metrics;
		},
		getMetricsNames: function() {
			return Object.keys(metrics);
		},

		// offenders
		addOffender: function(metricName, msg) {
			if (typeof offenders[metricName] === 'undefined') {
				offenders[metricName] = [];
			}

			offenders[metricName].push(msg);
		},

		getOffenders: function(metricName) {
			return offenders[metricName];
		},

		getAllOffenders: function() {
			return offenders;
		},

		// set URL report was generated for
		setUrl: function(val) {
			url = val;
		},
		getUrl: function() {
			return url;
		},

		// generator - phantomas vX.X.X
		setGenerator: function(val) {
			generator = val;
		},
		getGenerator: function() {
			return generator;
		},

		// asserts handling
		setAssert: function(metric, val) {
			asserts[metric] = val;
		},
		setAsserts: function(val) {
			asserts = val || {};
		},
		getAsserts: function() {
			return asserts;
		},
		hasAssertion: function(metric) {
			return typeof asserts[metric] !== 'undefined';
		},
		getAssertion: function(metric) {
			return asserts[metric];
		},

		// assertions
		assert: function(metric) {
			var expected = this.getAssertion(metric),
				val = this.getMetric(metric);

			if (!this.hasAssertion(metric) || typeof val === 'undefined') {
				return true;
			}

			return (typeof val === 'number') ? val <= expected : true;
		},
		getFailedAsserts: function() {
			return this.getMetricsNames().filter(function(metric) {
				return this.assert(metric) === false;
			}, this);
		}
	};
};
