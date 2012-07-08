/**
 * Results formatter
 */
var formatter = function(results, format) {
	function render() {
		switch(format) {
			case 'json':
				return formatJson();

			case 'plain':
			default:
				return formatPlain();
		}
	};

	function formatJson() {
		return JSON.stringify(results);
	};

	function formatPlain() {
		var res = '',
		    obj = results.metrics,
		    key;

		for (key in obj) {
			res += '* ' + key + ': ' + obj[key]+ '\n';
		};

		res += '\n';

		results.notices.forEach(function(msg) {
			res += '> ' + msg + "\n";
		});

		return res.trim();
	};

	// public interface
	this.render = render;
};

exports.formatter = formatter;

