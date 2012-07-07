/**
 * Simple HTTP requests monitor
 */

exports.module = function(phantomas) {
	// register metric
	phantomas.setMetric('HTTPRequests');

	phantomas.on('onResourceRequested', function(res) {
		phantomas.incrMetric('HTTPRequests');
	});
};
