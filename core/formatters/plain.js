/**
 * Results formatter for --format=plain
 */
var colors = require('ansicolors'),
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
			res.push('');

			// offenders
			var offenders = results.getAllOffenders();

			Object.keys(offenders).forEach(function(metric) {
				res.push(colors.brightGreen('Offenders for ' + metric + ' (' + results.getMetric(metric) + '):'));

				results.getOffenders(metric).forEach(function(msg) {
					res.push(' * ' + msg);
				});

				res.push('');
			});

			// notices
			results.getNotices().forEach(function(msg) {
				msg = msg.
					// color labels
					replace(/^[^ <][^:<]+:/, colors.brightGreen).
					// color URLs
					replace(/<[^>]+>/g, colors.brightBlue);

				// add a notice
				res.push(msg);
			});

			return res.join('\n').trim();
		}
	};
};
