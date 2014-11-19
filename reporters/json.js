/**
 * Results formatter for -R json
 *
 * Options:
 *  pretty - pretty print the JSON
 */
'use strict';

module.exports = function(results, reporterOptions) {
	var isMultiple = Array.isArray(results);

	function formatSingleRunResults(results) {
		var res = {
			generator: results.getGenerator(),
			url: results.getUrl(),
			metrics: results.getMetrics(),
			offenders: results.getAllOffenders(),
			asserts: false
		};

		// add asserts
		var asserts = results.getAsserts(),
			failedAsserts;

		if (Object.keys(asserts).length > 0) {
			failedAsserts = results.getFailedAsserts();

			res.asserts = {
				rules: asserts,
				failedCount: failedAsserts.length,
				failedAsserts: failedAsserts,
			};
		}

		return res;
	}

	// public API
	return {
		handlesMultiple: true,
		render: function() {
			var res;

			if (!isMultiple) {
				res = formatSingleRunResults(results);
			} else {
				var stats = new(require('../lib/stats'))();

				res = {
					runs: results.map(function(run) {
						return formatSingleRunResults(run);
					}),
					stats: {}
				};

				// generate metrics stats (issue #285)
				for (var i = 0, runs = results.length; i < runs; i++) {
					stats.pushMetrics(results[i].getMetrics());
				}

				stats.getMetrics().forEach(function(metricName) {
					res.stats[metricName] = stats.getMetricStats(metricName);
				});
			}

			// -R json:pretty
			if (reporterOptions.pretty === true) {
				return JSON.stringify(res, null, 2);
			} else {
				return JSON.stringify(res);
			}
		}
	};
};
