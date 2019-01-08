/**
 * Analyzes DOM changes via MutationObserver API
 *
 * @see http://dev.opera.com/articles/mutation-observers-tutorial/
 */
/* global window: true, document: true, MutationObserver: true */
'use strict';

module.exports = function(phantomas) {
	phantomas.setMetric('DOMmutationsInserts'); // @desc number of <body> node inserts
	phantomas.setMetric('DOMmutationsRemoves'); // @desc number of <body> node removes
	phantomas.setMetric('DOMmutationsAttributes'); // @desc number of DOM nodes attributes changes

	phantomas.on('init', () => phantomas.injectJs(__dirname + '/scope.js'));
};