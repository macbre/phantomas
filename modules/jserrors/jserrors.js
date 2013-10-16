/**
 * Meters the number of page errors, and provides traces after notices.
 */

exports.version = '0.2';

exports.module = function(phantomas) {
	var jsErrors = [];
	phantomas.setMetric('jsErrors', 0);
	
	function formatTrace(trace) {
		var ret = [];

		if(Array.isArray(trace)) {
			trace.forEach(function(entry) {
				ret.push((entry.function ? entry.function + '(): ' : 'unknown fn: ') + entry.sourceURL + ' @ ' + entry.line);
			});
		}

		return ret;
	}

	phantomas.on('jserror', function(msg, trace) {
		trace = formatTrace(trace);

		// register errors and show them in post-report notices section
		jsErrors.push({
			msg: msg,
			trace: trace
		});

		phantomas.log(msg);
		phantomas.log('Backtrace: ' + trace.join(' / '));

		phantomas.incrMetric('jsErrors');
	});

	phantomas.on('report', function() {
		if (jsErrors.length === 0) {
			return;
		}

		phantomas.addNotice('JS errors (' + jsErrors.length + '):');

		jsErrors.forEach(function(error) {
			phantomas.addNotice(' ' + error.msg);

			error.trace.forEach(function(t) {
				phantomas.addNotice('  ' + t);
			});
		});

		phantomas.addNotice();
	});
};
