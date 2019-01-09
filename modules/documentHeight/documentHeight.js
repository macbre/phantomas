/**
 * Measure document height
 */
/* global document: true */
'use strict';

module.exports = function(phantomas) {
	phantomas.setMetric('documentHeight'); // @desc the page height [px]

	// inject JS code
	phantomas.on('init', () => phantomas.injectJs(__dirname + '/scope.js'));
};
