/**
 * Analyzes DOM queries done via native DOM methods
 */
/* global Element: true, Document: true, Node: true, window: true */
'use strict';

exports.version = '0.9';

exports.module = function(phantomas) {
        phantomas.setMetric('DOMqueries'); // @desc number of all DOM queries @offenders
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
				function querySpy(type, query, fnName, context) {
					phantomas.emit('domQuery', type, query, fnName, context); // @desc DOM query has been made
				}

				phantomas.spy(Document.prototype, 'getElementById', function(id) {
					phantomas.incrMetric('DOMqueriesById');
					phantomas.addOffender('DOMqueriesById', '#%s (in %s)', id, '#document');
					querySpy('id', '#' + id, 'getElementById', '#document');
				});

				// selectors by class name
				function selectorClassNameSpy(className) {
					/* jshint validthis: true */
					var context =  phantomas.getDOMPath(this);

					phantomas.incrMetric('DOMqueriesByClassName');
					phantomas.addOffender('DOMqueriesByClassName', '.%s (in %s)', className, context);
					querySpy('class', '.' + className, 'getElementsByClassName', context);
				}

				phantomas.spy(Document.prototype, 'getElementsByClassName', selectorClassNameSpy);
				phantomas.spy(Element.prototype, 'getElementsByClassName', selectorClassNameSpy);

				// selectors by tag name
				function selectorTagNameSpy(tagName) {
					/* jshint validthis: true */
					var context =  phantomas.getDOMPath(this);

					phantomas.incrMetric('DOMqueriesByTagName');
					phantomas.addOffender('DOMqueriesByTagName', '%s (in %s)', tagName, context);
					querySpy('tag name', tagName, 'getElementsByTagName', context);
				}

				phantomas.spy(Document.prototype, 'getElementsByTagName', selectorTagNameSpy);
				phantomas.spy(Element.prototype, 'getElementsByTagName', selectorTagNameSpy);

				// selector queries
				function selectorQuerySpy(selector) {
					/* jshint validthis: true */
					var context =  phantomas.getDOMPath(this);

					phantomas.incrMetric('DOMqueriesByQuerySelectorAll');
					phantomas.addOffender('DOMqueriesByQuerySelectorAll', '%s (in %s)', selector, context);
					querySpy('selector', selector, 'querySelectorAll', context);
				}

				phantomas.spy(Document.prototype, 'querySelector', selectorQuerySpy);
				phantomas.spy(Document.prototype, 'querySelectorAll', selectorQuerySpy);
				phantomas.spy(Element.prototype, 'querySelector', selectorQuerySpy);
				phantomas.spy(Element.prototype, 'querySelectorAll', selectorQuerySpy);

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
