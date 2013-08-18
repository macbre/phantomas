/**
 * Analyzes DOM queries done via native DOM methods & jQuery
 */
exports.version = '0.4';

exports.module = function(phantomas) {
        phantomas.setMetric('DOMqueries');
        phantomas.setMetric('DOMqueriesById');
        phantomas.setMetric('DOMqueriesByClassName');
        phantomas.setMetric('DOMinserts');

	// fake native DOM functions
	phantomas.once('init', function() {
		phantomas.evaluate(function() {
			(function(phantomas) {
				// count DOM queries by either ID or class name
				var querySpy = function(query) {
					phantomas.log('DOM query: "' + query + '"');
					phantomas.incrMetric('DOMqueries');
				};

				phantomas.spy(window.document, 'getElementById', function(id) {
					phantomas.incrMetric('DOMqueriesById');
					querySpy('#' + id);
				});

				phantomas.spy(window.document, 'getElementsByClassName', function(className) {
					phantomas.incrMetric('DOMqueriesByClassName');
					querySpy('.' + className);
				});

				// count DOM inserts
				var appendSpy = function(child) {
					var hasParent = typeof this.parentNode !== 'undefined';

					// ignore appending to the node that's not yet added to DOM tree
					if (!hasParent) {
						return;
					}

					phantomas.incrMetric('DOMinserts');
					phantomas.log('DOM insert: node "' + phantomas.getDOMPath(child) + '" added to "' + phantomas.getDOMPath(this) + '"');
				};

				phantomas.spy(Node.prototype, 'appendChild', appendSpy);
				phantomas.spy(Node.prototype, 'insertBefore', appendSpy);
			})(window.__phantomas);
		});
	});
};
