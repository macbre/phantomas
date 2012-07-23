/**
 * localStorage metrics
 */
exports.version = '0.1';

exports.module = function(phantomas) {
	// add metrics
	phantomas.on('report', function() {
		//console.log(domains);
		phantomas.setMetricEvaluate('localStorageEntries', function() {
			return window.localStorage.length;
		});
	});
};
