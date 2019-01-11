/**
 * Analyzes events bound to DOM elements
 */
/* global Document: true, Element: true, window: true */
'use strict';

module.exports = function(phantomas) {
	phantomas.setMetric('eventsBound'); // @desc number of EventTarget.addEventListener calls
	phantomas.setMetric('eventsDispatched'); // @desc number of EventTarget.dispatchEvent calls
	phantomas.setMetric('eventsScrollBound'); // @desc number of scroll event bounds

	// inject JS code
	phantomas.on('init', () => phantomas.injectJs(__dirname + '/scope.js'));
};
