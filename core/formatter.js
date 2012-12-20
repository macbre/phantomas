/**
 * Results formatter
 */
var formatter = function(results, format) {
	function render() {
		switch(format) {
			case 'json':
				return formatJson();

			case 'csv':
				return formatCsv();

			case 'plain':
			default:
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
		var res = '',
			obj = results.metrics,
			key;

		// header
		res += 'phantomas metrics for <' + results.url + '>:\n\n';

		// metrics
		for (key in obj) {
			res += '* ' + key + ': ' + obj[key]+ '\n';
		}

		res += '\n';

		// notices
		results.notices.forEach(function(msg) {
			res += '> ' + msg + "\n";
		});

		return res.trim();
	}

	// public interface
	this.render = render;
};

exports.formatter = formatter;

