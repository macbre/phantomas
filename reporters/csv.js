/**
 * Results formatter for -R csv
 *
 * Options:
 *  no-header - omit CSV header
 *  timestamp - add the current timestamp as the first column
 *  url - add the URL as the first column
 *
 * @see https://github.com/touv/node-csv-string
 */
'use strict';

var CSV = require('csv-string');

module.exports = function(results, reporterOptions) {
	// public API
	return {
		render: function() {
			var metrics = results.getMetricsNames(),
				keys = [],
				values = [],
				ret = [];

			metrics.forEach(function(metric) {
				var value = results.getMetric(metric);

				keys.push(metric);
				values.push(value);
			});

			// -R csv:url
			if (reporterOptions.url === true) {
				values.unshift(results.getUrl());
				keys.unshift('url');
			}

			// -R csv:timestamp
			if (reporterOptions.timestamp === true) {
				values.unshift(new Date().toJSON().substr(0, 19));
				keys.unshift('timestamp');
			}

			// -R csv:no-header
			if (reporterOptions['no-header'] !== true) {
				ret.push(keys);
			}

			// add the values
			ret.push(values);

			return CSV.stringify(ret);
		}
	};
};
