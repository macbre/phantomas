/**
 * Results formatter for --format=csv
 *
 * @see https://github.com/touv/node-csv-string
 */
var CSV = require('csv-string');

module.exports = function(results) {
	// public API
	return {
		render: function() {
			var metrics = results.getMetricsNames(),
				keys = [],
				values = [];

			metrics.forEach(function(metric) {
				var value = results.getMetric(metric);

				keys.push(metric);
				values.push(value);
			});

			return CSV.stringify([keys, values]);
		}
	};
};
