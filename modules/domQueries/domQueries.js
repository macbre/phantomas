/**
 * Analyzes DOM queries done via native DOM methods
 */
exports.version = '0.5';

exports.module = function(phantomas) {
        phantomas.setMetric('DOMqueries');
        phantomas.setMetric('DOMqueriesById');
        phantomas.setMetric('DOMqueriesByClassName');
        phantomas.setMetric('DOMqueriesByTagName');
        phantomas.setMetric('DOMqueriesByQuerySelectorAll');
        phantomas.setMetric('DOMinserts');
        phantomas.setMetric('DOMqueriesDuplicated');

	// fake native DOM functions
	phantomas.once('init', function() {
		phantomas.evaluate(function() {
			(function(phantomas) {
				// count DOM queries by either ID, tag name, class name and selector query
				// @see https://dvcs.w3.org/hg/domcore/raw-file/tip/Overview.html#dom-document-doctype
				var DOMqueries = {};
				phantomas.set('DOMqueries', DOMqueries);

				function querySpy(type, query) {
					phantomas.log('DOM query: by ' + type + ' "' + query + '"');
					phantomas.incrMetric('DOMqueries');

					// detect duplicates
					var key = type + ' "' + query + '"';
					if (typeof DOMqueries[key] === 'undefined')  {
						DOMqueries[key] = 0;
					}

					DOMqueries[key]++;
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

	phantomas.on('report', function() {
		var DOMqueries = phantomas.getFromScope('DOMqueries') || {},
			queries = [];

		// TODO: implement phantomas.collection
		Object.keys(DOMqueries).forEach(function(query) {
			var cnt = DOMqueries[query];

			if (cnt > 1) {
				phantomas.incrMetric('DOMqueriesDuplicated');
				queries.push({
					query: query,
					cnt: cnt
				});
			}
		});

		queries.sort(function(a, b) {
			return (a.cnt > b.cnt) ? -1 : 1;
		});

		if (queries.length > 0) {
			queries.forEach(function(query) {
				phantomas.addOffender('DOMqueries', query.query + ': ' + query.cnt + ' queries');
			});
		}
	});
};
