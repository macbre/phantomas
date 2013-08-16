/**
 * Analyzes DOM queries done via native DOM methods & jQuery
 *
 */
exports.version = '0.2';

exports.module = function(phantomas) {

	// fake native DOM functions
	phantomas.once('init', function() {
		phantomas.evaluate(function() {
			(function() {
				var originalGetElementById = window.document.getElementById,
					originalGetElementsByClassName = window.document.getElementsByClassName,
					originalAppendChild = Node.prototype.appendChild,
					originalInsertBefore = Node.prototype.insertBefore;

				// metrics storage
				window.__phantomas.domQueries = 0;
				window.__phantomas.domInserts = 0;
				window.__phantomas.domInsertsBacktrace = [];

				window.__phantomas.jQueryOnDOMReadyFunctions = 0;
				window.__phantomas.jQueryOnDOMReadyFunctionsBacktrace = [];
	
				window.__phantomas.jQuerySelectors = 0;
				window.__phantomas.jQuerySelectorsBacktrace = [];

				// hook into DOM methods
				document.getElementById = function(id) {
					// log calls
					console.log('document.getElementById("' + id + '")');
					window.__phantomas.domQueries++;

					return originalGetElementById.call(document, id);
				};

				// count DOM inserts
				Node.prototype.appendChild = function(child) {
					var hasParent = typeof this.parentNode !== 'undefined';

					// ignore appending to the node that's not yet added to DOM tree
					if (!hasParent) {
						return;
					}

					var caller = window.__phantomas.getCaller();

					window.__phantomas.domInserts++;
					window.__phantomas.domInsertsBacktrace.push({
						url: caller.sourceURL,
						line: caller.line
					});

					return originalAppendChild.call(this, child);
				};

				Node.prototype.insertBefore = function(child) {
					var hasParent = typeof this.parentNode !== 'undefined';

					// ignore appending to the node that's not yet added to DOM tree
					if (!hasParent) {
						return;
					}

					var caller = window.__phantomas.getCaller();

					window.__phantomas.domInserts++;
					window.__phantomas.domInsertsBacktrace.push({
						url: caller.sourceURL,
						line: caller.line
					});

					return originalInsertBefore.call(this, child);
				};

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
			})();
		});
	});

	phantomas.on('loadFinished', function() {
		phantomas.setMetricEvaluate('DOMqueries', function() {
			return window.__phantomas.domQueries;
		});
		
		phantomas.setMetricEvaluate('DOMinserts', function() {
			return window.__phantomas.domInserts;
		});

		phantomas.setMetricEvaluate('jQuerySelectors', function() {
			return window.__phantomas.jQuerySelectors;
		});

		phantomas.setMetricEvaluate('jQueryOnDOMReadyFunctions', function() {
			return window.__phantomas.jQueryOnDOMReadyFunctions;
		});

		// list all selectors
		var selectorsBacktrace = phantomas.evaluate(function() {
			return window.__phantomas.jQuerySelectorsBacktrace;
		});
/**
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
