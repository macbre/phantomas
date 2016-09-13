/**
 * Number of times the current document has been painted to the screen
 *
 * This is a Firefox-specific feature.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window.mozPaintCount
 */
/* global window: true */
'use strict';

exports.version = '0.1';

exports.module = function(phantomas) {
	phantomas.setMetric('repaints'); // @desc number of repaints of the current document @gecko
	phantomas.setMetric('firstPaint'); // @desc time it took to perform the first paint @gecko @unreliable

	phantomas.on('init', function() {
		phantomas.evaluate(function() {
			(function(phantomas) {
				// feature detection
				if (typeof window.mozPaintCount === 'undefined') {
					phantomas.log('repaints: window.mozPaintCount not available!');
					return;
				}

				var lastPaintCountValue = 0,
					INTERVAL = 50;

				phantomas.log('repaints: the initial value is %j, polling every %d ms', window.mozPaintCount, INTERVAL);

				setInterval(function() {
					if (window.mozPaintCount > lastPaintCountValue) {
						if (lastPaintCountValue === 0) {
							phantomas.emit('firstPaint'); // @desc fired on the first paint @desc
							phantomas.emit('milestone', 'firstPaint');
						}

						lastPaintCountValue = window.mozPaintCount;
						phantomas.emit('paint', lastPaintCountValue); // @desc fired each time the document is painted @gecko
					}
				}, INTERVAL);
			})(window.__phantomas);
		});
	});

	phantomas.on('firstPaint', function() {
		phantomas.setMarkerMetric('firstPaint');
	});

	phantomas.on('paint', function(count) {
		phantomas.log('repaints: %d so far', count);
		phantomas.setMetric('repaints', count);
	});
};
