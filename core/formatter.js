/**
 * Generic JSON results formatter
 */
module.exports = function(results) {
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

	return JSON.stringify(res);
};
