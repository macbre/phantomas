/**
 * Analyzes DOM changes via MutationObserver API
 */
'use strict';

module.exports = phantomas => {
	// @see http://dev.opera.com/articles/mutation-observers-tutorial/
	phantomas.setMetric('DOMmutationsInserts'); // @desc number of <body> node inserts @offenders
	phantomas.setMetric('DOMmutationsRemoves'); // @desc number of <body> node removes @offenders
	phantomas.setMetric('DOMmutationsAttributes'); // @desc number of DOM nodes attributes changes @offenders
};
