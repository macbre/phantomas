/**
 * Meters the number of page errors, and provides traces after notices.
 */

exports.version = '0.2';

exports.module = function(phantomas) {
	phantomas.setMetric('jsErrors', 0);
	phantomas.on('jserror', function(msg, trace) {
		phantomas.addJsError({"msg" : msg, "trace" : trace});
		phantomas.incrMetric('jsErrors');
	});
};
