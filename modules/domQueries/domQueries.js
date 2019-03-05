/**
 * Analyzes DOM queries done via native DOM methods
 */
'use strict';

module.exports = phantomas => {
	phantomas.setMetric('DOMqueries'); // @desc number of all DOM queries @offenders
	phantomas.setMetric('DOMqueriesWithoutResults'); // @desc number of DOM queries that returned nothing @offenders
	phantomas.setMetric('DOMqueriesById'); // @desc number of document.getElementById calls @offenders
	phantomas.setMetric('DOMqueriesByClassName'); // @desc number of document.getElementsByClassName calls @offenders
	phantomas.setMetric('DOMqueriesByTagName'); // @desc number of document.getElementsByTagName calls @offenders
	phantomas.setMetric('DOMqueriesByQuerySelectorAll'); // @desc number of document.querySelector(All) calls @offenders
	phantomas.setMetric('DOMinserts'); // @desc number of DOM nodes inserts @offenders
	phantomas.setMetric('DOMqueriesDuplicated'); // @desc number of DOM queries called more than once
	phantomas.setMetric('DOMqueriesAvoidable'); // @desc number of repeated uses of a duplicated query 

	//
	// TODO: pass events fired by page scoped code
	//

	// report DOM queries that return no results (issue #420)
	phantomas.on('domQuery', function(type, query, fnName, context, hasNoResults) {
		// ignore DOM queries within DOM fragments (used internally by jQuery)
		if (context.indexOf('body') !== 0 && context.indexOf('#document') !== 0) {
			return;
		}

		if (hasNoResults === true) {
			phantomas.incrMetric('DOMqueriesWithoutResults');
			phantomas.addOffender('DOMqueriesWithoutResults', {query, node: context, 'function': fnName});
		}
	});

	// count DOM queries by either ID, tag name, class name and selector query
	// @see https://dvcs.w3.org/hg/domcore/raw-file/tip/Overview.html#dom-document-doctype
	var Collection = require('../../lib/collection'),
		DOMqueries = new Collection();

	phantomas.on('domQuery', function(type, query, fnName, context) {
		phantomas.log('DOM query: by %s - "%s" (using %s) in %s', type, query, fnName, context);
		phantomas.incrMetric('DOMqueries');

		// Don't count document fragments or not yet inserted elements inside duplicated queries
		if (context && (
				context.indexOf('html') === 0 ||
				context.indexOf('body') === 0 ||
				context.indexOf('head') === 0 ||
				context.indexOf('#document') === 0
			)) {
			DOMqueries.push(type + ' "' + query + '" (in ' + context + ')');
		}
	});

	phantomas.on('report', () => {
		DOMqueries.sort().forEach((query, count) => {
			if (count > 1) {
				phantomas.incrMetric('DOMqueriesDuplicated');
				phantomas.incrMetric('DOMqueriesAvoidable', count - 1);
				phantomas.addOffender('DOMqueriesDuplicated', {query, count});
			}
		});
	});
};
