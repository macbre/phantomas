/**
 * Measure when onDOMready and window.onload events are fired
 */
exports.version = '0.2';

exports.module = function(phantomas) {
	// emulate window.performance
	// @see https://groups.google.com/d/topic/phantomjs/WnXZLIb_jVc/discussion
	phantomas.on('init', function() {
		phantomas.evaluate(function() {
			(function(phantomas) {
				var start = Date.now();

				document.addEventListener("DOMContentLoaded", function() {
					phantomas.set('onDOMReadyTime', Date.now() - start);
					console.log('onDOMready');
				}, false);

				window.addEventListener("load", function() {
					phantomas.set('windowOnLoadTime', Date.now() - start);
					console.log('window.onload');
				}, false);
			})(window.__phantomas);
		});
	});

	// called just before report is generated
	phantomas.on('report', function() {
		phantomas.setMetricFromScope('onDOMReadyTime');
		phantomas.setMetricFromScope('windowOnLoadTime');
	});
};
