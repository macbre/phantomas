/**
 * Results formatter for --format=plain
 */
module.exports = function(results) {
	var colors = require('ansicolors');

	function render() {
		var res = [];

		// header
		res.push('phantomas metrics for <' + results.getUrl() + '>:');
		res.push('');

		// metrics
		results.getMetricsNames().forEach(function(metric) {
			res.push('* ' + metric + ': ' + results.getMetric(metric));
		});
		res.push('');

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

	// public API
	this.render = render;
};
