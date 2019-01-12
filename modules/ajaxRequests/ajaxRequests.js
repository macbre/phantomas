/**
 * Analyzes AJAX requests
 */
/* global window: true */
'use strict';

module.exports = function(phantomas) {
	phantomas.setMetric('ajaxRequests'); // @desc number of AJAX requests

	// inject JS code
	phantomas.on('init', () => phantomas.injectJs(__dirname + '/scope.js'));
};
