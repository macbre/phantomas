/**
 * Measure when onDOMready and window.onload events are fired
 */
exports.version = '0.1';

exports.module = function(phantomas) {

	// emulate window.performance
	// @see https://groups.google.com/d/topic/phantomjs/WnXZLIb_jVc/discussion
	phantomas.on('init', function() {
		phantomas.evaluate(function() {
			window.__phantomas.timingLoadStarted = Date.now();

			document.addEventListener("DOMContentLoaded", function() {
				window.__phantomas.timingDOMContentLoaded = Date.now();
				console.log('onDOMready');
			}, false);

			window.addEventListener("load", function() {
				window.__phantomas.timingOnLoad = Date.now();
				console.log('window.onload');
			}, false);
		});
	});

	// called just before report is generated
	phantomas.on('report', function() {
		phantomas.setMetricEvaluate('onDOMReadyTime', function() {
			return window.__phantomas.timingDOMContentLoaded - window.__phantomas.timingLoadStarted;
		});

		phantomas.setMetricEvaluate('windowOnLoadTime', function() {
			return window.__phantomas.timingOnLoad - window.__phantomas.timingLoadStarted;
		});
	});
};
