/**
 * Generic JSON results formatter
 */
'use strict';

module.exports = function(results) {
	var res = {
		generator: results.getGenerator(),
		url: results.getUrl(),
		metrics: results.getMetrics(),
		offenders: results.getAllOffenders(),
		asserts: false
	};

	// add asserts
	var asserts = results.getAsserts();

	if (Object.keys(asserts).length > 0) {
		res.asserts = asserts;
	}

	return JSON.stringify(res);
};
