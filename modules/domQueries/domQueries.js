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
				window.phantomas.domQueries = 0;
				window.phantomas.domInserts = 0;
				window.phantomas.domInsertsBacktrace = [];

				window.phantomas.jQueryOnDOMReadyFunctions = 0;
				window.phantomas.jQueryOnDOMReadyFunctionsBacktrace = [];
	
				window.phantomas.jQuerySelectors = 0;
				window.phantomas.jQuerySelectorsBacktrace = [];

				// hook into DOM methods
				document.getElementById = function(id) {
					// log calls
					console.log('document.getElementById("' + id + '")');
					window.phantomas.domQueries++;

					return originalGetElementById.call(document, id);
				};

				// count DOM inserts
				Node.prototype.appendChild = function(child) {
					var caller = window.phantomas.getCaller();

					window.phantomas.domInserts++;
					window.phantomas.domInsertsBacktrace.push({
						url: caller.sourceURL,
						line: caller.line
					});

					return originalAppendChild.call(this, child);
				};

				Node.prototype.insertBefore = function(child) {
					var caller = window.phantomas.getCaller();

					window.phantomas.domInserts++;
					window.phantomas.domInsertsBacktrace.push({
						url: caller.sourceURL,
						line: caller.line
					});

					return originalInsertBefore.call(this, child);
				};

				// the following approach is unstable
				// @see https://github.com/osteele/jquery-profile
				return;

				// hook into $.fn.init to catch DOM queries
				var originalJQuery,
					originalJQueryFnInit;
		
				window.__defineSetter__('jQuery', function(val) { console.log('jQuery setter');
					originalJQuery = val;
					originalJQueryFnInit = val.fn.init;
	
					val.fn.init = function() {
						// log calls
						var selector = arguments[0],
							caller = window.phantomas.getCaller();

						// count selectors
						switch (typeof selector) {
							case 'string':
								//console.log('$("' + selector + '")');

								window.phantomas.jQuerySelectors++;
								window.phantomas.jQuerySelectorsBacktrace.push({
									selector: selector,
									url: caller.sourceURL,
									line: caller.line
								});
								break;

							case 'function':
								//console.log('$( onDOMReadyFunction() {} )');
								window.phantomas.jQueryOnDOMReadyFunctions++;
								window.phantomas.jQueryOnDOMReadyFunctionsBacktrace.push({
									url: caller.sourceURL,
									line: caller.line
								});
								break;
						}

						return originalJQueryFnInit.apply(val.fn, arguments);
					};

					// Give the init function the jQuery prototype for later instantiation (taken from jQuery source)
					//val.fn.init.prototype = val.fn;

					console.log('Mocked jQuery v' + val.fn.jquery + ' object');
				});

				window.__defineGetter__('jQuery', function() {
					return originalJQuery;
				});
			})();
		});
	});

	phantomas.on('loadFinished', function() {
		phantomas.setMetricEvaluate('DOMqueries', function() {
			return window.phantomas.domQueries;
		});
		
		phantomas.setMetricEvaluate('DOMinserts', function() {
			return window.phantomas.domInserts;
		});

		phantomas.setMetricEvaluate('jQuerySelectors', function() {
			return window.phantomas.jQuerySelectors;
		});

		phantomas.setMetricEvaluate('jQueryOnDOMReadyFunctions', function() {
			return window.phantomas.jQueryOnDOMReadyFunctions;
		});

		// list all selectors
		var selectorsBacktrace = phantomas.evaluate(function() {
			return window.phantomas.jQuerySelectorsBacktrace;
		});

		phantomas.addNotice('jQuery selectors:');
		selectorsBacktrace.forEach(function(item) {
			phantomas.addNotice('* $("' + item.selector + '") called from ' + item.url + ' @ ' + item.line);
		});
		phantomas.addNotice();

		// list all onDOMReady functions
		var onDOMReadyBacktrace = phantomas.evaluate(function() {
			return window.phantomas.jQueryOnDOMReadyFunctionsBacktrace;
		});

		phantomas.addNotice('jQuery onDOMReady functions (' + onDOMReadyBacktrace.length + '):');
		onDOMReadyBacktrace.forEach(function(item) {
			phantomas.addNotice('* bound from ' + item.url + ' @ ' + item.line);
		});
		phantomas.addNotice();

		// list all DOM inserts
		var domInsertsBacktrace = phantomas.evaluate(function() {
			return window.phantomas.domInsertsBacktrace;
		});

		phantomas.addNotice('DOM inserts (' + domInsertsBacktrace.length + '):');
		domInsertsBacktrace.forEach(function(item) {
			phantomas.addNotice('* from ' + item.url + ' @ ' + item.line);
		});
		phantomas.addNotice();


	});
};
