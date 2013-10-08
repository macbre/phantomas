/**
 * localStorage metrics
 */
exports.version = '0.2';

exports.module = function(phantomas) {
	// add metrics
	phantomas.on('report', function() {
		//console.log(domains);
		phantomas.setMetricEvaluate('localStorageEntries', function() {
			try {
				return window.localStorage.length;
			}
			catch(ex) {
				window.__phantomas.log('localStorageEntries: not set because ' + ex + '!');
				return 0;
			}
		});
	});
};
