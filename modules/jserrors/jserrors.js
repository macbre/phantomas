/**
 * Meters the number of page errors, and provides traces as offenders for "jsErrors" metric
 */
exports.version = '0.3';

exports.module = function(phantomas) {
	phantomas.setMetric('jsErrors');
	
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

		phantomas.log(msg);
		phantomas.log('Backtrace: ' + trace.join(' / '));

		phantomas.incrMetric('jsErrors');
		phantomas.addOffender('jsErrors', msg + ' - ' + trace.join(' / '));
	});
};
