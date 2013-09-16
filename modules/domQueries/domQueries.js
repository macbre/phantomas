/**
 * Analyzes DOM queries done via native DOM methods
 */
exports.version = '0.4';

exports.module = function(phantomas) {
        phantomas.setMetric('DOMqueries');
        phantomas.setMetric('DOMqueriesById');
        phantomas.setMetric('DOMqueriesByClassName');
        phantomas.setMetric('DOMqueriesByTagName');
        phantomas.setMetric('DOMqueriesByQuerySelectorAll');
        phantomas.setMetric('DOMinserts');

	// fake native DOM functions
	phantomas.once('init', function() {
		phantomas.evaluate(function() {
			(function(phantomas) {
				// count DOM queries by either ID, tag name, class name and selector query
				// @see https://dvcs.w3.org/hg/domcore/raw-file/tip/Overview.html#dom-document-doctype
				function querySpy(type, query) {
					phantomas.log('DOM query: by ' + type + ' "' + query + '"');
					phantomas.incrMetric('DOMqueries');
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
					querySpy('selector', selector);
				}

				phantomas.spy(Document.prototype, 'querySelectorAll', selectorQuerySpy);
				phantomas.spy(Element.prototype, 'querySelectorAll', selectorQuerySpy);

				// count DOM inserts
				function appendSpy(child) {
					var hasParent = typeof this.parentNode !== 'undefined';

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
};
