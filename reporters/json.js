/**
 * Results formatter for -R json
 *
 * Options:
 *  pretty - pretty print the JSON
 */
'use strict';

module.exports = function(results, reporterOptions) {
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
		render: async function() {
			const res = formatSingleRunResults(results);

			// -R json:pretty
			if (reporterOptions.pretty === true) {
				return JSON.stringify(res, null, 2);
			} else {
				return JSON.stringify(res);
			}
		}
	};
};
