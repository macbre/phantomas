/**
 * Analyzes DOM queries done via native DOM methods & jQuery
 */
exports.version = '0.3';

exports.module = function(phantomas) {
        phantomas.setMetric('DOMqueries');
        phantomas.setMetric('DOMinserts');
        phantomas.setMetric('jQuerySelectors');
        phantomas.setMetric('jQueryOnDOMReadyFunctions');

	// fake native DOM functions
	phantomas.once('init', function() {
		phantomas.evaluate(function() {
			(function(phantomas) {
				// metrics storage
				phantomas.set('DOMqueries', 0);
				phantomas.set('DOMinserts', 0);
				//phantomas.domInsertsBacktrace = [];

				//phantomas.set('jQueryOnDOMReadyFunctions', 0);
				//phantomas.jQueryOnDOMReadyFunctionsBacktrace = [];
	
				//phantomas.set('jQuerySelectors', 0);
				//phantomas.jQuerySelectorsBacktrace = [];

				// count DOM queries by either ID or class name
				var querySpy = function(query) {
					phantomas.log('DOM query: "' + query + '"');
					phantomas.incr('DOMqueries');
				};

				phantomas.spy(window.document, 'getElementById', function(id) {
					querySpy('#' + id);
				});
				phantomas.spy(window.document, 'getElementsByClassName', function(className) {
					querySpy('.' + className);
				});

				// count DOM inserts
				var appendSpy = function(child) {
					var hasParent = typeof this.parentNode !== 'undefined';

					// ignore appending to the node that's not yet added to DOM tree
					if (!hasParent) {
						return;
					}

					phantomas.incr('DOMinserts');
					/**
					var caller = phantomas.getCaller();
					phantomas.domInsertsBacktrace.push({
						url: caller.sourceURL,
						line: caller.line
					});
					**/
				};

				phantomas.spy(Node.prototype, 'appendChild', appendSpy);
				phantomas.spy(Node.prototype, 'insertBefore', appendSpy);

				/**
				// hook into $.fn.init to catch DOM queries
				// 
				// TODO: use a better approach here:
				// @see https://github.com/osteele/jquery-profile
				var jQuery;
		
				window.__defineSetter__('jQuery', function(val) {
					jQuery = val;
					console.log('Mocked jQuery v' + val.fn.jquery + ' object');
				});

				window.__defineGetter__('jQuery', function() {
					return jQuery;
				});
				**/
			})(window.__phantomas);
		});
	});

	phantomas.on('report', function() {
		phantomas.setMetricFromScope('DOMqueries');
		phantomas.setMetricFromScope('DOMinserts');
/**
		phantomas.setMetricFromScope('jQuerySelectors');
		phantomas.setMetricFromScope('jQueryOnDOMReadyFunctions');

		// list all selectors
		var selectorsBacktrace = phantomas.evaluate(function() {
			return window.__phantomas.jQuerySelectorsBacktrace;
		});
		phantomas.addNotice('jQuery selectors:');
		selectorsBacktrace.forEach(function(item) {
			phantomas.addNotice('* $("' + item.selector + '") called from ' + item.url + ' @ ' + item.line);
		});
		phantomas.addNotice();

		// list all onDOMReady functions
		var onDOMReadyBacktrace = phantomas.evaluate(function() {
			return window.__phantomas.jQueryOnDOMReadyFunctionsBacktrace;
		});

		phantomas.addNotice('jQuery onDOMReady functions (' + onDOMReadyBacktrace.length + '):');
		onDOMReadyBacktrace.forEach(function(item) {
			phantomas.addNotice('* bound from ' + item.url + ' @ ' + item.line);
		});
		phantomas.addNotice();

		// list all DOM inserts
		var domInsertsBacktrace = phantomas.evaluate(function() {
			return window.__phantomas.domInsertsBacktrace;
		});

		phantomas.addNotice('DOM inserts (' + domInsertsBacktrace.length + '):');
		domInsertsBacktrace.forEach(function(item) {
			phantomas.addNotice('* from ' + item.url + ' @ ' + item.line);
		});
		phantomas.addNotice();
**/
	});
};
