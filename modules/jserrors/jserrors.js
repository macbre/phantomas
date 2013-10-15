/**
 * Meters the number of page errors, and provides traces after notices.
 */

exports.version = '0.2';

exports.module = function(phantomas) {
	phantomas.setMetric('jsErrors', 0);
	
	function error_log(error) {
		var errorReport;
		phantomas.log(error.msg);
		if(error.trace && error.trace.length) {
			errorReport = [];
			error.trace.forEach(function(t) {
				errorReport.push('file: ' + t.file+ ' @ line: ' + t.line + (t['function'] ? ' (in function "' + t['function'] + '")' : ''));
			});
			phantomas.log('Backtrace: ' + errorReport.join(' / '));
		}
	}
	
	phantomas.on('jserror', function(msg, trace) {
		var error = {"msg":msg, "trace":trace};
		phantomas.addJsError(error);
		phantomas.incrMetric('jsErrors');
		error_log(error);
	});
};
