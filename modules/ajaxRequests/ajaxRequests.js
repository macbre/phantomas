/**
 * Analyzes AJAX requests
 */
'use strict';

exports.version = '0.3';

exports.module = function(phantomas) {
	phantomas.setMetric('ajaxRequests'); // @desc number of AJAX requests
	phantomas.setMetric('synchronousXHR'); // @desc number of synchronous XMLHttpRequest

	phantomas.on('send', function(entry, res) {
		if (entry.isAjax) {
			phantomas.incrMetric('ajaxRequests');
			phantomas.addOffender('ajaxRequests', entry.url);
		}
	});

	phantomas.on('init', function() {
		phantomas.evaluate(function() {
			(function(phantomas) {
				phantomas.spy(window.XMLHttpRequest.prototype, 'open', function(result, method, url, async) {
					if (async === false) {
						phantomas.incrMetric('synchronousXHR');
						phantomas.addOffender('synchronousXHR', url);
						phantomas.log('ajaxRequests: synchronous XMLHttpRequest call to <%s>', url);
					}
				}, true);
			})(window.__phantomas);
		});
	});
};
