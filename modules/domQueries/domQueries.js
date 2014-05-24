/**
 * Analyzes DOM queries done via native DOM methods
 */
/* global Element: true, Document: true, Node: true, window: true */
'use strict';

exports.version = '0.6';

exports.module = function(phantomas) {
        phantomas.setMetric('DOMqueries'); // @desc number of all DOM queries @offenders
        phantomas.setMetric('DOMqueriesById'); // @desc number of document.getElementById calls
        phantomas.setMetric('DOMqueriesByClassName'); // @desc number of document.getElementsByClassName calls
        phantomas.setMetric('DOMqueriesByTagName'); // @desc number of document.getElementsByTagName calls
        phantomas.setMetric('DOMqueriesByQuerySelectorAll'); // @desc number of document.querySelectorAll calls
        phantomas.setMetric('DOMinserts'); // @desc number of DOM nodes inserts
        phantomas.setMetric('DOMqueriesDuplicated'); // @desc number of duplicated DOM queries

	// fake native DOM functions
	phantomas.once('init', function() {
		phantomas.evaluate(function() {
			(function(phantomas) {
				function querySpy(type, query) {
					phantomas.emit('domQuery', type, query); // @desc DOM query has been made
				}

				phantomas.spy(Document.prototype, 'getElementById', function(id) {
					phantomas.incrMetric('DOMqueriesById');
					querySpy('id', '#' + id);
				});

				phantomas.spy(Document.prototype, 'getElementsByClassName', function(className) {
					phantomas.incrMetric('DOMqueriesByClassName');
					querySpy('class', '.' + className);
				});

				phantomas.spy(Document.prototype, 'getElementsByTagName', function(tagName) {
					phantomas.incrMetric('DOMqueriesByTagName');
					querySpy('tag name', tagName);
				});

				// selector queries
				function selectorQuerySpy(selector) {
					phantomas.incrMetric('DOMqueriesByQuerySelectorAll');
					phantomas.addOffender('DOMqueriesByQuerySelectorAll', selector);
					querySpy('selector', selector);
				}

				phantomas.spy(Document.prototype, 'querySelectorAll', selectorQuerySpy);
				phantomas.spy(Element.prototype, 'querySelectorAll', selectorQuerySpy);

				// count DOM inserts
				function appendSpy(child) {
					/* jshint validthis: true */
					var hasParent = (typeof this.parentNode !== 'undefined');

					// ignore appending to the node that's not yet added to DOM tree
					if (!hasParent) {
						return;
					}

					phantomas.incrMetric('DOMinserts');
					phantomas.log('DOM insert: node "' + phantomas.getDOMPath(child) + '" added to "' + phantomas.getDOMPath(this) + '"');
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

	phantomas.on('domQuery', function(type, query) {
		phantomas.log('DOM query: by %s - "%s"', type, query);
		phantomas.incrMetric('DOMqueries');

		DOMqueries.push(type + ' "' + query + '"');
	});

	phantomas.on('report', function() {
		DOMqueries.sort().forEach(function(query, cnt) {
			if (cnt > 1) {
				phantomas.incrMetric('DOMqueriesDuplicated');
				phantomas.addOffender('DOMqueriesDuplicated', '%s: %d queries', query, cnt);
			}
		});
	});
};
