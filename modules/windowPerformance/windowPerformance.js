/**
 * Measure when onDOMready and window.onload events are fired
 */
exports.version = '0.1';

exports.module = function(phantomas) {

	// emulate window.performance
	// @see https://groups.google.com/d/topic/phantomjs/WnXZLIb_jVc/discussion
	phantomas.on('init', function() {
		phantomas.evaluate(function() {
			window.timingLoadStarted = Date.now();

			document.addEventListener("DOMContentLoaded", function() {
				window.timingDOMContentLoaded = Date.now();
				console.log('onDOMready');
			}, false);

			window.addEventListener("load", function(){
				window.timingOnLoad = Date.now();
				console.log('window.onload');
			}, false);
		});
	});

	// called just before report is generated
	phantomas.on('report', function() {
		phantomas.setMetric('onDOMReady', phantomas.evaluate(function() {
			return window.timingDOMContentLoaded - window.timingLoadStarted;
 		}));

		phantomas.setMetric('windowOnLoad', phantomas.evaluate(function() {
			return window.timingOnLoad - window.timingLoadStarted;
 		}));
	});
};
