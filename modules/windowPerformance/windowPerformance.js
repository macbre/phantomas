/**
 * Measure when document state reaches certain states
 *
 * @see http://w3c-test.org/webperf/specs/NavigationTiming/#dom-performancetiming-domloading
 */
exports.version = '0.5';

exports.module = function(phantomas) {
	// times below are calculated relative to performance.timing.responseEnd (#117)
	phantomas.setMetric('onDOMReadyTime');       // i.e. Navigation Timing - domContentLoadedEventStart and domComplete
	phantomas.setMetric('onDOMReadyTimeEnd');    // i.e. Navigation Timing - domContentLoadedEventEnd
	phantomas.setMetric('windowOnLoadTime');     // i.e. Navigation Timing - loadEventStart
	phantomas.setMetric('windowOnLoadTimeEnd');  // i.e. Navigation Timing - loadEventEnd

	// backend vs frontend time
	phantomas.setMetric('timeBackend');
	phantomas.setMetric('timeFrontend');

	// measure onDOMReadyTime and windowOnLoadTime from the moment HTML response was fully received
	var responseEndTime = Date.now();

	phantomas.on('responseEnd', function() {
		responseEndTime = Date.now();
		phantomas.log('Performance timing: responseEnd');

		phantomas.evaluate(function(responseEndTime) {
			window.performance = window.performance || {timing: {}};
			window.performance.timing.responseEnd = responseEndTime;
		}, responseEndTime);
	});

	phantomas.on('init', function() {
		phantomas.evaluate(function(responseEndTime) {
			(function(phantomas) {
				phantomas.spyEnabled(false, 'installing window.performance metrics');

				// extend window.performance
				// "init" event is sometimes fired twice, pass a value set by "responseEnd" event handler (fixes #192)
				window.performance = window.performance || {
					timing: {
						responseEnd: responseEndTime
					}
				};

				// emulate Navigation Timing
				document.addEventListener('readystatechange', function() {
					var readyState = document.readyState,
						responseEndTime = window.performance.timing.responseEnd,
						time = Date.now() - responseEndTime,
						metricName;

					// @see http://www.w3.org/TR/html5/dom.html#documentreadystate
					switch(readyState) {
						// DOMContentLoaded
						case 'interactive':
							metricName = 'onDOMReadyTime';
							break;

						// window.onload
						case 'complete':
							metricName = 'windowOnLoadTime';
							break;

						default:
							phantomas.log('Performance timing: unhandled "' + readyState + '" state!');
							return;
					}

					phantomas.setMarkerMetric(metricName);
					phantomas.log('Performance timing: document reached "' + readyState + '" state after ' + time + ' ms');

					// measure when event handling is completed
					setTimeout(function() {
						var time = Date.now() - responseEndTime;

						phantomas.setMarkerMetric(metricName + 'End');
						phantomas.log('Performance timing: "' + readyState + '" state handling completed after ' + time + ' ms (experimental)');
					}, 0);
				});

				phantomas.spyEnabled(true);
			})(window.__phantomas);
		}, responseEndTime);
	});

	// fallback for --disable-js mode
	phantomas.on('loadFinished', function() {
		var time;

		if (phantomas.getMetric('onDOMReadyTime') === 0) {
			time = phantomas.setMarkerMetric('windowOnLoadTime');
			phantomas.setMarkerMetric('windowOnLoadTimeEnd');

			phantomas.log('Performance timing: document reached "complete" state after ' + time + ' ms (no JS fallback)');
		}
	});

	/**
	 * Emit metrics with backend vs frontend time
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

		phantomas.setMetric('timeBackend', backendTimePercentage);
		phantomas.setMetric('timeFrontend', 100 - backendTimePercentage);
	});
};
