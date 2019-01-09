/**
 * localStorage metrics
 */
/* global window: true */
'use strict';

module.exports = function(phantomas) {
	phantomas.setMetric('localStorageEntries'); // @desc number of entries in local storage

	// inject JS code
	phantomas.on('init', () => phantomas.injectJs(__dirname + '/scope.js'));
};
