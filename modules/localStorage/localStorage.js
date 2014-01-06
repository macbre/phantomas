/**
 * localStorage metrics
 */
exports.version = '0.3';

exports.module = function(phantomas) {
	phantomas.on('report', function() {
		// number and names of entries in local storage
		var entries = phantomas.evaluate(function() {
			try {
				return Object.keys(window.localStorage);
			}
			catch(ex) {
				window.__phantomas.log('localStorageEntries: not set because ' + ex + '!');
				return false;
			}
		});

		if (entries) {
			phantomas.setMetric('localStorageEntries', entries.length);

			if (entries.length > 0) {
				phantomas.addOffender('localStorageEntries', entries.join(', '));
			}
		}
	});
};
