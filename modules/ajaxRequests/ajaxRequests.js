/**
 * Analyzes AJAX requests
 */
exports.version = '0.1';

exports.module = function(phantomas) {
	phantomas.setMetric('ajaxRequests');

	phantomas.on('send', function(entry, res) {
		if (entry.isAjax) {
			phantomas.log('AJAX request: <' + entry.url + '>');
			phantomas.incrMetric('ajaxRequests');
		}
	});
};
