/**
 * Analyzes events bound to DOM elements
 */
/* global Document: true, Element: true, window: true */
'use strict';

exports.version = '0.3';

exports.module = function(phantomas) {
	phantomas.setMetric('eventsBound'); // @desc number of EventTarget.addEventListener calls
	phantomas.setMetric('eventsDispatched'); // @desc number of EventTarget.dispatchEvent calls

	phantomas.once('init', function() {
		phantomas.evaluate(function() {
			(function(phantomas) {
				// spy calls to EventTarget.addEventListener
				// @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget.addEventListener
				function eventSpy(eventType) {
					/* jshint validthis: true */
					var path = phantomas.getDOMPath(this);
					phantomas.log('DOM event: "' + eventType + '" bound to "' + path + '"');

					phantomas.incrMetric('eventsBound');
					phantomas.addOffender('eventsBound', '"%s" bound to "%s"', eventType, path);
				}

				phantomas.spy(Element.prototype, 'addEventListener', eventSpy);
				phantomas.spy(Document.prototype, 'addEventListener', eventSpy);
				phantomas.spy(window, 'addEventListener', eventSpy);

				// spy calls to EventTarget.dispatchEvent
				// @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget.dispatchEvent
				phantomas.spy(Element.prototype, 'dispatchEvent', function(ev) {
					/* jshint validthis: true */
					var path = phantomas.getDOMPath(this);

					phantomas.log('Core JS event: triggered "%s" on "%s"', ev.type, path);

					phantomas.incrMetric('eventsDispatched');
					phantomas.addOffender('eventsDispatched', '"%s" on "%s"', ev.type, path);
				});
			})(window.__phantomas);
		});
	});
};
