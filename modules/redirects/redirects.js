/**
 * Analyzes HTTP redirects
 */
exports.version = '0.1';

exports.module = function(phantomas) {
	phantomas.setMetric('redirects');
	phantomas.setMetric('redirectsTime');

	phantomas.on('recv', function(entry, res) {
		if (entry.isRedirect) {
			phantomas.incrMetric('redirects');
			phantomas.incrMetric('redirectsTime', entry.timeToLastByte);

			phantomas.addOffender('redirects', entry.url + ' is a redirect (HTTP ' + entry.status + ' ' + entry.statusText + ') ' +
				'to ' + (res.redirectURL || entry.headers.Location) + ' (took ' + entry.timeToLastByte + ' ms)');
		}
	});
};
