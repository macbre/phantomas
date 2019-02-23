/**
 * Takes a look at "time to first (last) byte" metrics
 */
'use strict';

module.exports = function(phantomas) {
	var measured = false;

	phantomas.setMetric('timeToFirstByte'); // @desc time it took to receive the first byte of the first response (that was not a redirect)
	phantomas.setMetric('timeToLastByte'); // @desc time it took to receive the last byte of the first response (that was not a redirect)

	phantomas.on('recv', function(entry, res) {
		// metrics already calculated
		if (measured) {
			return;
		}

		if (entry.isRedirect) {
			phantomas.log('Time to first byte: <%s> is a redirect', entry.url);
			return;
		}

		phantomas.setMetric('timeToFirstByte', entry.timeToFirstByte, true);
		phantomas.setMetric('timeToLastByte', entry.timeToLastByte, true);

		measured = true;

		phantomas.log('Time to first byte: set to %d ms for request to <%s> (HTTP %d)', entry.timeToFirstByte, entry.url, entry.status);
		phantomas.log('Time to last byte: set to %d ms', entry.timeToLastByte);

		phantomas.emit('responseEnd', entry, res); // @desc The first response (that was not a redirect) fully received
	});
};
