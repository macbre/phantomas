/**
 * Metrics stats implementation to be used by reporters
 * when phantomas is executed in multiple runs mode
 */
'use strict';

var Stats = require('./fast-stats').Stats;

function stats() {
	/* jshint validthis: true */
	// use pushMetrics() to add results for each run
	this.metrics = [];
	this.runs = 0;

	// stats to be calculated
	// @see https://github.com/bluesmoon/node-faststats
	this.stats = {
		min: function(values) {
			return values.range()[0];
		},
		max: function(values) {
			return values.range()[1];
		},
		average: function(values) {
			return values.amean().toFixed(2);
		},
		median: function(values) {
			return values.median().toFixed(2);
		},
		stddev: function(values) {
			return values.stddev().toFixed(2);
		}
	};

	this.statsNames = Object.keys(this.stats);
}

// add key/value collection of metrics values
stats.prototype.pushMetrics = function(metrics) {
	this.metrics.push(metrics);
	this.runs++;
};

// get list of metrics name
stats.prototype.getMetrics = function() {
	if (this.runs > 0) {
		return Object.keys(this.metrics[0]);
	} else {
		return [];
	}
};

// get stats for given metric
stats.prototype.getMetricStats = function(metricName) {
	var i,
		stats = {},
		value,
		values = new Stats();

	for (i = 0; i < this.runs; i++) {
		value = this.metrics[i][metricName];

		if (typeof value === 'number') {
			values.push(this.metrics[i][metricName]);
		}
	}

	// apply stats functions
	this.getAvailableStats().forEach(function(fnName) {
		stats[fnName] = parseFloat(this.stats[fnName](values));
	}, this);

	return stats;
};

stats.prototype.getAvailableStats = function() {
	return this.statsNames;
};

module.exports = stats;
