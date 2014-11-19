/**
 * Results formatter for --format=statsd
 *
 * --reporter statsd
 * --statsd-host localhost
 * --statsd-port 8125
 * --statsd-prefix "myapp.frontPage."
 *
 * Options:
 *  <host>:<port>:<prefix>
 *
 * @see https://github.com/sivy/node-statsd
 */
'use strict';

var StatsD = require('node-statsd').StatsD;

module.exports = function(results, reporterOptions, options) {
	var client,
		debug = require('debug')('phantomas:reporter:statsd'),
		params;

	// -R statsd:<host>:<port>:<prefix>
	if (reporterOptions.length > 0) {
		options['statsd-host'] = reporterOptions[0];
		options['statsd-port'] = reporterOptions[1];
		options['statsd-prefix'] = reporterOptions[2];
	}

	params = {
		host: options['statsd-host'] || 'localhost',
		port: options['statsd-port'] || 8125,
		prefix: (typeof options['statsd-prefix'] === 'undefined') ? 'phantomas.' : options['statsd-prefix']
	};

	debug('Patameters: %j', params);

	// public API
	return {
		render: function(done) {
			var client = new StatsD(params),
				metrics = results.getMetricsNames(),
				remaining = metrics.length,
				bytesSent = 0;

			client.socket.on('error', function(error) {
				debug('Error in socket: %s', error);
			});

			metrics.forEach(function(metric) {
				var value = results.getMetric(metric);

				if (isNaN(parseFloat(value))) {
					debug('Not sending %s as "%s" is not a numeric metric', metric, value);
					remaining--;
				} else {
					//debug('Sending %s = %s...', metric, value);

					client.gauge(metric, value, function(err, bytes) {
						if (err) {
							debug('Error: %s', err);
						} else {
							bytesSent += bytes;
							remaining--;

							if (remaining === 0) {
								debug('All metrics sent (%d bytes)', bytesSent);
								done();
							}
						}
					});
				}
			});
		}
	};
};
