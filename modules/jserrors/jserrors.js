/**
 * Meters the number of page errors, and provides traces after notices.
 */

exports.version = '0.2';

exports.module = function(phantomas) {
	var jsErrors = [];
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
		var error = {
			msg: msg,
			trace: trace
		};
		jsErrors.push(error);

		phantomas.incrMetric('jsErrors');
		error_log(error);
	});

	phantomas.on('report', function() {
		if (jsErrors.length === 0) {
			return;
		}

		phantomas.addNotice('JS errors (' + jsErrors.length + '):');

		jsErrors.forEach(function(error) {
			phantomas.addNotice(' ' + error.msg);

			if(error.trace.length) {
				error.trace.forEach(function(t) {
					/* t['function'] to skip error on eclipse */
					phantomas.addNotice('  file: ' + t.file+ ' @ line: ' + t.line + (t['function'] ? ' (in function "' + t['function'] + '")' : ''));
				});
			}
		});

		phantomas.addNotice();
	});
};
