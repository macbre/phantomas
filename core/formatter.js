/**
 * Results formatter
 */
module.exports = function(results, format) {
	function render() {
		switch(format) {
			case 'json':
				return formatJson();

			case 'csv':
				return formatCsv();

			default:
			case 'plain':
				return formatPlain();
		}
	}

	function formatJson() {
		return JSON.stringify(results);
	}

	function formatCsv() {
		var obj = results.metrics,
			key,
			keys = [],
			values = [];

		for (key in obj) {
			keys.push(key);
			values.push(obj[key]);
		}

		return keys.join(',') + "\n" + values.join(',');
	}

	function formatPlain() {
		var colors = require('ansicolors'),
			res = '',
			metrics = results.metrics;

		// header
		res += 'phantomas metrics for <' + results.url + '>:\n\n';

		// metrics
		Object.keys(metrics).forEach(function(metric) {
			res += '* ' + metric + ': ' + metrics[metric]+ '\n';
		});

		res += '\n';

		// notices
		results.notices.forEach(function(msg) {
			msg = msg.
				// color labels
				replace(/^[^ <][^:<]+:/, colors.brightGreen).
				// color URLs
				replace(/<[^>]+>/g, colors.brightBlue);

			// add a notice
			res += msg + "\n";
		});

		res += '\n';

		// errors
		results.jsErrors.forEach(function(msg) {
			msg = msg.replace(/^[^ <].*/, colors.brightRed);
			res += msg + "\n";
		});

		res += '\n';

		return res.trim();
	}

	// public interface
	this.render = render;
};
