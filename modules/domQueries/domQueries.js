/**
 * Analyzes DOM queries done via native DOM methods
 */
/* global Element: true, Document: true, Node: true, window: true */
'use strict';

exports.version = '1.0';

exports.module = function(phantomas) {
	phantomas.setMetric('DOMqueries'); // @desc number of all DOM queries @offenders
	phantomas.setMetric('DOMqueriesWithoutResults'); // @desc number of DOM queries that returned nothing @offenders
	phantomas.setMetric('DOMqueriesById'); // @desc number of document.getElementById calls
	phantomas.setMetric('DOMqueriesByClassName'); // @desc number of document.getElementsByClassName calls
	phantomas.setMetric('DOMqueriesByTagName'); // @desc number of document.getElementsByTagName calls
	phantomas.setMetric('DOMqueriesByQuerySelectorAll'); // @desc number of document.querySelector(All) calls
	phantomas.setMetric('DOMinserts'); // @desc number of DOM nodes inserts
	phantomas.setMetric('DOMqueriesDuplicated'); // @desc number of DOM queries called more than once
	phantomas.setMetric('DOMqueriesAvoidable'); // @desc number of repeated uses of a duplicated query 

	// fake native DOM functions
	phantomas.once('init', function() {
		phantomas.evaluate(function() {
			(function(phantomas) {
				function querySpy(type, query, fnName, context, hasNoResults) {
					phantomas.emit('domQuery', type, query, fnName, context, hasNoResults); // @desc DOM query has been made
				}

				phantomas.spy(Document.prototype, 'getElementById', function(results, id) {
					phantomas.incrMetric('DOMqueriesById');
					phantomas.addOffender('DOMqueriesById', '#%s (in %s)', id, '#document');
					querySpy('id', '#' + id, 'getElementById', '#document', (results === null));
				}, true);

				// selectors by class name
				function selectorClassNameSpy(results, className) {
					/* jshint validthis: true */
					var context = phantomas.getDOMPath(this);

					phantomas.incrMetric('DOMqueriesByClassName');
					phantomas.addOffender('DOMqueriesByClassName', '.%s (in %s)', className, context);
					querySpy('class', '.' + className, 'getElementsByClassName', context, (results.length === 0));
				}

				phantomas.spy(Document.prototype, 'getElementsByClassName', selectorClassNameSpy, true);
				phantomas.spy(Element.prototype, 'getElementsByClassName', selectorClassNameSpy, true);

				// selectors by tag name
				function selectorTagNameSpy(results, tagName) {
					/* jshint validthis: true */
					var context = phantomas.getDOMPath(this);

					// querying by BODY and body is the same (issue #419)
					tagName = tagName.toLowerCase();

					phantomas.incrMetric('DOMqueriesByTagName');
					phantomas.addOffender('DOMqueriesByTagName', '%s (in %s)', tagName, context);
					querySpy('tag name', tagName, 'getElementsByTagName', context, (results.length === 0));
				}

				phantomas.spy(Document.prototype, 'getElementsByTagName', selectorTagNameSpy, true);
				phantomas.spy(Element.prototype, 'getElementsByTagName', selectorTagNameSpy, true);

				// selector queries
				function selectorQuerySpy(results, selector) {
					/* jshint validthis: true */
					var context = phantomas.getDOMPath(this);

					phantomas.incrMetric('DOMqueriesByQuerySelectorAll');
					phantomas.addOffender('DOMqueriesByQuerySelectorAll', '%s (in %s)', selector, context);
					querySpy('selector', selector, 'querySelectorAll', context, (results === null || results.length === 0));
				}

				phantomas.spy(Document.prototype, 'querySelector', selectorQuerySpy, true);
				phantomas.spy(Document.prototype, 'querySelectorAll', selectorQuerySpy, true);
				phantomas.spy(Element.prototype, 'querySelector', selectorQuerySpy, true);
				phantomas.spy(Element.prototype, 'querySelectorAll', selectorQuerySpy, true);

				// count DOM inserts
				function appendSpy(child) {
					/* jshint validthis: true */
					// ignore appending to the node that's not yet added to DOM tree
					if (!this.parentNode) {
						return;
					}

					var destNodePath = phantomas.getDOMPath(this),
						appendedNodePath = phantomas.getDOMPath(child);

					// don't count elements added to fragments as a DOM inserts (issue #350)
					// DocumentFragment > div[0]
					if (destNodePath.indexOf('DocumentFragment') === 0) {
						return;
					}

					phantomas.incrMetric('DOMinserts');
					phantomas.addOffender('DOMinserts', '"%s" appended to "%s"', appendedNodePath, destNodePath);

					phantomas.log('DOM insert: node "%s" appended to "%s"', appendedNodePath, destNodePath);
				}

				phantomas.spy(Node.prototype, 'appendChild', appendSpy);
				phantomas.spy(Node.prototype, 'insertBefore', appendSpy);
			})(window.__phantomas);
		});
	});

	// report DOM queries that return no results (issue #420)
	phantomas.on('domQuery', function(type, query, fnName, context, hasNoResults) {
		// ignore DOM queries within DOM fragments (used internally by jQuery)
		if (context.indexOf('body') !== 0 && context.indexOf('#document') !== 0) {
			return;
		}

		if (hasNoResults === true) {
			phantomas.incrMetric('DOMqueriesWithoutResults');
			phantomas.addOffender('DOMqueriesWithoutResults', '%s (in %s) using %s', query, context, fnName);
		}
	});

	// count DOM queries by either ID, tag name, class name and selector query
	// @see https://dvcs.w3.org/hg/domcore/raw-file/tip/Overview.html#dom-document-doctype
	var Collection = require('../../lib/collection'),
		DOMqueries = new Collection();

	phantomas.on('domQuery', function(type, query, fnName, context) {
		phantomas.log('DOM query: by %s - "%s" (using %s) in %s', type, query, fnName, context);
		phantomas.incrMetric('DOMqueries');

		DOMqueries.push(type + ' "' + query + '" (in ' + context + ')');
	});

	phantomas.on('report', function() {
		DOMqueries.sort().forEach(function(query, cnt) {
			if (cnt > 1) {
				phantomas.incrMetric('DOMqueriesDuplicated');
				phantomas.incrMetric('DOMqueriesAvoidable', cnt - 1);
				phantomas.addOffender('DOMqueriesDuplicated', '%s: %d queries', query, cnt);
			}
		});
	});
};
