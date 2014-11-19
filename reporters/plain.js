/**
 * Results formatter for --format=plain
 *
 * Options:
 *  no-color - disable ANSI colors
 */
'use strict';

var colors = require('../lib/ansicolors'),
	fold = require('travis-fold'),
	rpad = require('../core/pads').rpad,
	OK = '✓',
	ERR = '✗';

module.exports = function(results, reporterOptions) {
	var isMultiple = Array.isArray(results),
		noColor = (reporterOptions['no-color'] === true);

	function formatSingleRunResults(results) {
		var res = [];

		if (noColor) {
			colors.disable();
		}

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
				} else {
					line = rpad(ERR + line, 50) + 'Assertion failed! Expected to be less than or equal: ' + results.getAssertion(metric);
					line = colors.brightRed(line);
				}
			} else {
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
			stats = new(require('../lib/stats'))(),
			runs = results.length,
			fields, table;

		// table title and heading
		table = new AsciiTable();
		table.setTitle(format('Report from %d run(s) for <%s> using %s', runs, results[0].getUrl(), results[0].getGenerator()));
		table.setTitleAlignLeft();

		var heading = [];
		heading.push(AsciiTable.alignCenter('Metric', 30));

		stats.getAvailableStats().forEach(function(name) {
			heading.push(AsciiTable.alignCenter(name, 12));
		});

		table.setHeading(heading);

		// metrics stats
		for (var i = 0; i < runs; i++) {
			stats.pushMetrics(results[i].getMetrics());
		}

		// generate rows (one for each metric)
		stats.getMetrics().forEach(function(metricName) {
			var row = [],
				metricStats = stats.getMetricStats(metricName);

			row.push(metricName);

			Object.keys(metricStats).forEach(function(stat) {
				row.push(metricStats[stat]);
			});

			table.addRow(row);
		});

		return table.toString() + "\n";
	}

	// public API
	return {
		handlesMultiple: true,
		render: function() {
			if (!isMultiple) {
				return formatSingleRunResults(results);
			} else {
				return formatMultipleRunResults(results);
			}
		}
	};
};
