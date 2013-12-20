/**
 * Results formatter for --format=plain
 */
var colors = require('ansicolors'),
	fold = require('travis-fold'),
	rpad = require('../pads').rpad,
	OK = '✓',
	ERR = '✗';

module.exports = function(results) {
	// public API
	return {
		render: function() {
			var res = [];

			// header
			res.push(results.getGenerator() + ' metrics for <' + results.getUrl() + '>:');
			res.push('');

			// metrics
			fold.pushStart(res, 'metrics');

			results.getMetricsNames().forEach(function(metric) {
				var line = ' ' + metric + ': ' + results.getMetric(metric);

				// check asserts
				if (results.hasAssertion(metric)) {
					if (results.assert(metric)) {
						line = colors.brightGreen(OK + line);
					}
					else {
						line = rpad(ERR + line, 50) + 'Assertion failed! Expected to be less than or equal: ' + results.getAssertion(metric);
						line = colors.brightRed(line);
					}
				}
				else {
					line = '*' + line;
				}

				res.push(line);
			});

			fold.pushEnd(res, 'metrics');
			res.push('');

			// offenders
			var offenders = results.getAllOffenders();
			fold.pushStart(res, 'offenders');

			Object.keys(offenders).forEach(function(metric) {
				var LIMIT = 50,
					offenders = results.getOffenders(metric),
					len = offenders.length;

				res.push(colors.brightGreen('Offenders for ' + metric + ' (' + results.getMetric(metric) + '):'));

				// limit the ammount of offenders emitted
				offenders.slice(0, LIMIT).forEach(function(msg) {
					res.push(' * ' + msg);
				});

				if (len > LIMIT) {
					res.push(colors.brightBlack('(' + (len - LIMIT) + ' more)'));
				}

				res.push('');
			});

			fold.pushEnd(res, 'offenders');

			// notices
			fold.pushStart(res, 'notices');

			results.getNotices().forEach(function(msg) {
				msg = msg.
					// color labels
					replace(/^[^ <][^:<]+:/, colors.brightGreen).
					// color URLs
					replace(/<[^>]+>/g, colors.brightBlue);

				// add a notice
				res.push(msg);
			});
			fold.pushEnd(res, 'notices');

			return fold.wrap(
				results.getUrl(),
				res.join('\n').trim()
			);
		}
	};
};
