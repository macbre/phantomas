/**
 * Analyzes HTTP redirects
 */
'use strict';

exports.version = '0.1';

exports.module = function(phantomas) {
	phantomas.setMetric('redirects'); // @desc number of HTTP redirects (either 301, 302 or 303)
	phantomas.setMetric('redirectsTime'); // @desc time it took to send and receive redirects

	phantomas.on('recv', function(entry, res) {
		if (entry.isRedirect) {
			phantomas.incrMetric('redirects');
			phantomas.incrMetric('redirectsTime', entry.timeToLastByte);

			phantomas.addOffender('redirects', entry.url + ' is a redirect (HTTP ' + entry.status + ' ' + entry.statusText + ') ' +
				'to ' + (res.redirectURL || entry.headers.Location) + ' (took ' + entry.timeToLastByte + ' ms)');
		}
	});
};
