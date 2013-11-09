/**
 * Results formatter for --format=tap
 *
 * @see http://podwiki.hexten.net/TAP/TAP.html?page=TAP
 * @see https://github.com/isaacs/node-tap
 */
module.exports = function(results) {
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
					msg = metric;

				// check asserts
				if (results.hasAssertion(metric)) {
					if (!results.assert(metric)) {
						isOk = false;
						failedCnt++;

						msg += ' # expected ' + results.getMetric(metric)  + ' to be less than or equal ' + results.getAssertion(metric);
					}
				}
				else {
					// mark metrics with no assertions as skipped
					msg += ' # SKIP';
				}

				res.push([
					isOk ? 'ok' : 'not ok',
					testNo++,
					msg
				].join(' '));
			});

			res.push('# Total: ' + metrics.length);
			res.push('# Failed: ' + failedCnt);

			return res.join('\n').trim();
		}
	};
};
