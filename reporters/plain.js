/**
 * Results formatter for --format=plain
 */
var colors = require('../lib/ansicolors'),
	fold = require('travis-fold'),
	rpad = require('../core/pads').rpad,
	OK = '✓',
	ERR = '✗';

module.exports = function(results) {
	var isMultiple = Array.isArray(results);

	function formatSingleRunResults(results) {
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

		return fold.wrap(
			results.getUrl(),
			res.join('\n').trim()
		) + '\n';
	}

	function formatMultipleRunResults(results) {
		var AsciiTable = require('ascii-table'),
			format = require('util').format,
			stats = require('fast-stats').Stats,
			runs = results.length,
			table;

		function getMetricStats(metricName) {
			var i,
				res,
				values = new stats();

			for (i=0; i<runs; i++) {
				values.push(results[i].getMetric(metricName));
			}

			// @see https://github.com/bluesmoon/node-faststats
			res = {
				metric: metricName,
				min: values.range()[0],
				max: values.range()[1],
				avg: values.amean().toFixed(2),
				med: values.median().toFixed(2)
			};

			return res;
		}

		// table title and heading
		table = new AsciiTable();
		table.setTitle(format('Report from %d run(s) for <%s> using %s', runs, results[0].getUrl(), results[0].getGenerator()));
		table.setTitleAlignLeft();

		table.setHeading(
			AsciiTable.alignCenter('Metric', 30),
			AsciiTable.alignCenter('Min', 12),
			AsciiTable.alignCenter('Max', 12),
			AsciiTable.alignCenter('Average', 12),
			AsciiTable.alignCenter('Median', 12)
		);

		// metrics stats
		results[0].getMetricsNames().forEach(function(metricName) {
			var cols,
				stats = getMetricStats(metricName);

			cols = Object.keys(stats).map(function(key) {
				return stats[key];
			});

			table.addRow(cols);
		});

		return table.toString() + "\n";
	}

	// public API
	return {
		handlesMultiple: true,
		render: function() {
			if (!isMultiple) {
				return formatSingleRunResults(results);
			}
			else {
				return formatMultipleRunResults(results);
			}
		}
	};
};
