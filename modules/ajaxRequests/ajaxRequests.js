/**
 * Analyzes AJAX requests
 */
/* global window: true */
'use strict';

module.exports = function(phantomas) {
	phantomas.setMetric('ajaxRequests'); // @desc number of AJAX requests

	return; // TODO

	phantomas.on('init', function() {
		phantomas.evaluate(function() {
			(function(phantomas) {
				phantomas.spy(window.XMLHttpRequest.prototype, 'open', function(result, method, url, async) {
					phantomas.incrMetric('ajaxRequests');
					phantomas.addOffender('ajaxRequests', '<%s> [%s]', url, method);
				}, true);
			})(window.__phantomas);
		});
	});
};
