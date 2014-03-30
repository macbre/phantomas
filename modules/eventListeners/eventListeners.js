/**
 * Analyzes events bound to DOM elements
 */
/* global Document: true, Element: true, window: true */
'use strict';

exports.version = '0.1';

exports.module = function(phantomas) {
        phantomas.setMetric('eventsBound'); // @desc number of EventTarget.addEventListener calls

	// spy calls to EventTarget.addEventListener
	// @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget.addEventListener
	phantomas.once('init', function() {
		phantomas.evaluate(function() {
			(function(phantomas) {
				function eventSpy(eventType) {
					/* jshint validthis: true */
					phantomas.log('DOM event: "' + eventType + '" bound to "' + phantomas.getDOMPath(this) + '"');
					phantomas.incr('eventsBound');
				}

				phantomas.spy(Element.prototype, 'addEventListener', eventSpy);
				phantomas.spy(Document.prototype, 'addEventListener', eventSpy);
			})(window.__phantomas);
		});
	});

	phantomas.on('report', function() {
		phantomas.setMetricFromScope('eventsBound');
	});
};
