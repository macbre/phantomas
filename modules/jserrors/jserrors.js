/**
 * Meters the number of page errors, and provides traces after notices.
 */

exports.version = '0.1';

exports.module = function(phantomas) {
	var errors = [];

	phantomas.on('jserror', function(msg, trace) {
		errors.push({"msg":msg, "trace":trace});
	});

	phantomas.on('report', function() {
		var len = errors.length || 0;
		phantomas.setMetric('jsErrors', len);
	});
};
