/**
 * Results formatter for --format=graphite
 * Use with ./phantomas --url <yoururl.com> --format graphite | nc <yourgraphitehost.org> <graphiteport>
 * ex : ./phantomas --url http://www.google.com --format graphite | nc mygraphite.org 2003
 *
 * if "stats_counts.phantomas" doesn't fit your needs, just replace it :
 * Use with ./phantomas --url <yoururl.com> --format graphite | replace "stats_counts.phantomas" "whatuwant" | nc <yourgraphitehost.org> <graphiteport>
 */
var fold = require('travis-fold');

module.exports = function(results) {
	// public API
	return {
		render: function() {
			var res = [],
				timestamp = Math.round(new Date().getTime() / 1000);

			//clean the url
			var cleanUrl = results.getUrl().replace(/http\:\/\/www?\./,'').replace(/\/$/,'').replace(/\W/g,'-');

			// metrics
			fold.pushStart(res, 'metrics');

			results.getMetricsNames().forEach(function(metric) {
				var line = 'stats_counts.phantomas.' + cleanUrl + '.' + metric + ' ' + results.getMetric(metric) + ' ' + timestamp;

				res.push(line);
			});

			fold.pushEnd(res, 'metrics');
			res.push('');


			return fold.wrap(
				results.getUrl(),
				res.join('\n').trim()
			);
		}
	};
};
