/**
 * Measure when onDOMready and window.onload events are fired
 */
exports.version = '0.2';

exports.module = function(phantomas) {
	phantomas.setMetric('onDOMReadyTime');
	phantomas.setMetric('windowOnLoadTime');

	// emulate window.performance
	// @see https://github.com/ariya/phantomjs/issues/10031
	phantomas.on('init', function() {
		phantomas.evaluate(function() {
			(function(phantomas) {
				var start = Date.now();

				document.addEventListener("DOMContentLoaded", function() {
					phantomas.setMetric('onDOMReadyTime', Date.now() - start);
					phantomas.log('onDOMready');
				}, false);

				window.addEventListener("load", function() {
					phantomas.setMetric('windowOnLoadTime', Date.now() - start);
					phantomas.log('window.onload');
				}, false);
			})(window.__phantomas);
		});
	});
};
