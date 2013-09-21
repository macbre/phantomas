/**
 * Meters the number of page errors, and provides traces after notices.
 */

exports.version = '0.1';

exports.module = function(phantomas) {
	var errors = [];

	phantomas.on('pageerror', function(msg, trace) {
		errors.push({"msg":msg, "trace":trace});
	});

	phantomas.on('report', function() {
		var len = errors.length || 0;
		phantomas.setMetric('errors', len);

		if (len > 0) {
			errors.forEach(function(e) {
				phantomas.addError(e.msg);
				e.trace.forEach(function(item) {
					var fn = item.function || '(anonymous function)';
					phantomas.addError(' ' + fn + ' ' + item.file + ':' + item.line);
				});
				phantomas.addError();
			});
		}
	});
};
