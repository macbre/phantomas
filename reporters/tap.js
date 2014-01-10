/**
 * Results formatter for --format=tap
 *
 * @see http://podwiki.hexten.net/TAP/TAP.html?page=TAP
 * @see https://github.com/isaacs/node-tap
 */
var Producer = require('tap').Producer;

module.exports = function(results) {
	// public API
	return {
		render: function() {
			var metrics = results.getMetricsNames(),
				res = [];

			res.push(results.getGenerator() + ' results for <' + results.getUrl() + '>');

			// metrics
			metrics.forEach(function(metric) {
				var entry = {
					ok: true,
					name: metric
				};

				// check asserts
				if (results.hasAssertion(metric)) {
					if (!results.assert(metric)) {
						entry.ok = false;

						entry.expected = results.getAssertion(metric);
						entry.actual = results.getMetric(metric);
					}
				}
				else {
					// mark metrics with no assertions as skipped
					entry.skip = true;
				}

				// add offenders
				var offenders = results.getOffenders(metric);
				if (offenders) {
					entry.offenders = offenders;
				}

				res.push(entry);
			});

			return Producer.encode(res, true /* emit yanlish data in TAP */);
		}
	};
};
