/**
 * Measure when onDOMready and window.onload events are fired
 */
exports.version = '0.3';

exports.module = function(phantomas) {
	phantomas.setMetric('onDOMReadyTime');
	phantomas.setMetric('windowOnLoadTime');

	// emulate window.performance
	// @see https://github.com/ariya/phantomjs/issues/10031
	phantomas.on('init', function() {
		phantomas.evaluate(function() {
			(function(phantomas) {
				var start = Date.now();

				phantomas.spyEnabled(false, 'installing window.performance metrics');

				document.addEventListener("DOMContentLoaded", function() {
					phantomas.setMetric('onDOMReadyTime', Date.now() - start);
					phantomas.log('onDOMready');
				}, false);

				window.addEventListener("load", function() {
					phantomas.setMetric('windowOnLoadTime', Date.now() - start);
					phantomas.log('window.onload');
				}, false);

				phantomas.spyEnabled(true);
			})(window.__phantomas);
		});
	});

	/**
	 * Emit a notice with backend vs frontend time
	 *
	 * Performance Golden Rule:
	 * "80-90% of the end-user response time is spent on the frontend. Start there."
	 *
	 * @see http://www.stevesouders.com/blog/2012/02/10/the-performance-golden-rule/
	 */
	phantomas.on('report', function() {
		//  The “backend” time is the time it takes the server to get the first byte back to the client.
		//  The “frontend” time is everything else (measured until window.onload)
		var backendTime = parseInt(phantomas.getMetric('timeToFirstByte'), 10),
			frontendTime = parseInt(phantomas.getMetric('windowOnLoadTime'), 10),
			totalTime = backendTime + frontendTime,
			backendTimePercentage;

		if (totalTime === 0) {
			return;
		}

		backendTimePercentage = Math.round(backendTime / totalTime * 100);
		phantomas.addNotice('Time spent on backend / frontend: ' + backendTimePercentage + '% / ' + (100 - backendTimePercentage) + '%');
	});
};
