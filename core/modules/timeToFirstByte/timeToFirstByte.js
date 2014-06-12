/**
 * TTFB / TTLB metrics
 */
'use strict';

exports.version = '1.1';

exports.module = function(phantomas) {
	var measured = false,
		reqId = 1; // request ID to consider when calculating TTFB / TTLB

	phantomas.setMetric('timeToFirstByte'); // @desc time it took to receive the first byte of the first response (that was not a redirect)
	phantomas.setMetric('timeToLastByte'); // @desc time it took to receive the last byte of the first response (that was not a redirect)

	phantomas.on('recv', function(entry, res) {
		// metrics already calculated
		if (measured) {
			return;
		}

		if (entry.isRedirect) {
			// wait for the next request
			reqId = entry.id + 1;

			phantomas.log('Time to first byte: response #%d <%s> is a redirect (waiting for response #%d)', entry.id, entry.url, reqId);
			return;
		}

		// check the first response which is not a redirect (issue #74)
		if (entry.id === reqId) {
			phantomas.setMetric('timeToFirstByte', entry.timeToFirstByte, true);
			phantomas.setMetric('timeToLastByte', entry.timeToLastByte, true);

			measured = true;

			phantomas.log('Time to first byte: set to %d ms for #%d request to <%s> (HTTP %d)', entry.timeToFirstByte, entry.id, entry.url, entry.status);
			phantomas.log('Time to last byte: set to %d ms', entry.timeToLastByte);

			phantomas.emitInternal('responseEnd', entry, res); // @desc the first response (that was not a redirect) fully received
		}
	});
};
