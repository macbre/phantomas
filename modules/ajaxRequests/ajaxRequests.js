/**
 * Analyzes AJAX requests
 */
exports.version = '0.2';

exports.module = function(phantomas) {
	phantomas.setMetric('ajaxRequests');

	phantomas.on('send', function(entry, res) {
		if (entry.isAjax) {
			phantomas.incrMetric('ajaxRequests');
			phantomas.addOffender('ajaxRequests', entry.url);
		}
	});
};
