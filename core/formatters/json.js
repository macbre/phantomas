/**
 * Results formatter for --format=json
 */
module.exports = function(results) {
	// public API
	return {
		render: function() {
			var res = {
				generator: results.getGenerator(),
				url: results.getUrl(),
				metrics: results.getMetrics(),
				offenders: results.getAllOffenders(),
				asserts: false,
				notices: results.getNotices()
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

			return JSON.stringify(res);
		}
	};
};
