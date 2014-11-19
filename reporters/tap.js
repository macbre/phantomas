/**
 * Results formatter for --format=tap
 *
 * Options:
 *  no-skip - don't print out metrics that were skipped
 *
 * @see http://podwiki.hexten.net/TAP/TAP.html?page=TAP
 * @see https://github.com/isaacs/node-tap
 */
'use strict';

var Producer = require('tap').Producer;

module.exports = function(results, reporterOptions) {
	// public API
	return {
		render: function() {
			var metrics = results.getMetricsNames(),
				noSkip = (reporterOptions['no-skip'] === true),
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
					} else {
						entry.value = results.getMetric(metric);
					}
				} else {
					// mark metrics with no assertions as skipped
					entry.skip = true;
					entry.value = results.getMetric(metric);
				}

				// add offenders
				var offenders = results.getOffenders(metric);
				if (offenders) {
					// properly encode YAML to make it work in Jenkins
					offenders = offenders.map(function(entry) {
						return '"' + entry.replace(/"/g, '') + '"';
					});

					entry.offenders = offenders;
				}

				// -R tap:no-skip
				if (noSkip && entry.skip) {
					return;
				}

				res.push(entry);
			});

			return Producer.encode(res, true /* emit yanlish data in TAP */ );
		}
	};
};
