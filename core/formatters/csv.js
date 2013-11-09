/**
 * Results formatter for --format=csv
 */
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
				values.push( (typeof value === 'number') ? value : '"' + value + '"' );
			});

			return keys.join(',') + "\n" + values.join(',');
		}
	};
};
