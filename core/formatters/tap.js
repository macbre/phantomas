/**
 * Results formatter for --format=tap
 *
 * @see http://podwiki.hexten.net/TAP/TAP.html?page=TAP
 * @see https://github.com/isaacs/node-tap
 */
module.exports = function(results) {
	var yaml = require('yamlish');

	// public API
	return {
		render: function() {
			var res = [],
				metrics = results.getMetricsNames();
				testNo = 1,
				failedCnt = 0;

			// version
			res.push('TAP version 13');

			// generator info and URL
			res.push('# ' + results.getGenerator() + ' results for <' + results.getUrl() + '>');

			// the plan
			res.push('1..' + metrics.length);

			// metrics
			metrics.forEach(function(metric) {
				var isOk = true,
					msg = metric,
					data = false,
					offenders;

				// check asserts
				if (results.hasAssertion(metric)) {
					if (!results.assert(metric)) {
						isOk = false;
						failedCnt++;

						data = {
							expected: results.getAssertion(metric),
							actual: results.getMetric(metric)
						};
					}
				}
				else {
					// mark metrics with no assertions as skipped
					msg += ' # SKIP';
				}

				// add offenders
				offenders = results.getOffenders(metric);

				if (offenders) {
					if (data === false) {
						data = {};
					}

					data.offenders = offenders;
				}

				// add a row to TAP
				res.push([
					isOk ? 'ok' : 'not ok',
					testNo++,
					msg
				].join(' '));

				// emit additional data (if any)
				// @see http://testanything.org/wiki/index.php/YAMLish
				if (data) {
					res.push("  ---" + yaml.encode(data));
					res.push("  ...");
				}
			});

			res.push('# Total: ' + metrics.length);
			res.push('# Failed: ' + failedCnt);

			return res.join('\n').trim();
		}
	};
};
