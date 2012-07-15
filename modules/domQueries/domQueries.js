/**
 * Analyzes DOM queries done via native DOM methods & jQuery
 *
 */
exports.version = '0.2';

exports.module = function(phantomas) {

	// fake native DOM functions
	phantomas.on('init', function() {
		phantomas.evaluate(function() {
			(function() {
				var originalGetElementById = document.getElementById,
					originalGetElementsByClassName = document.getElementsByClassName;

				// metrics storage
				window.phantomas.domQueries = 0;

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

				// hook into $.fn.init to catch DOM queries
				var originalJQuery,
					originalJQueryFnInit;
		
				window.__defineSetter__('jQuery', function(val) { console.log('jQuery setter');
					originalJQuery = val;
					originalJQueryFnInit = val.fn.init;
	
					val.fn.init = function() {
						// log calls
						var selector = arguments[0],
							caller = {};

						// get backtrace to get a caller
						// TODO: move to window.phantomas.getCaller()
						try {
							throw new Error('backtrace');
						} catch(e) {
							caller = (e.stackArray && e.stackArray[2]) || {};
						}

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
					val.fn.init.prototype = val.fn;

					console.log('Mocked jQuery v' + val.fn.jquery + ' object');

					// remove mocks when page is loaded
					$(window).bind('load', function() {
						val.fn.init = originalJQueryFnInit;
						document.getElementById = originalGetElementById;
						document.getElementsByClassName = originalGetElementsByClassName;
					});
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

		phantomas.setMetricEvaluate('jQuerySelectors', function() {
			return window.phantomas.jQuerySelectors;
		});

		phantomas.setMetricEvaluate('jQueryOnDOMReadyFunctions', function() {
			return window.phantomas.jQueryOnDOMReadyFunctions;
		});

		return;

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

		phantomas.addNotice('jQuery onDOMReady functions:');
		onDOMReadyBacktrace.forEach(function(item) {
			phantomas.addNotice('* bound from ' + item.url + ' @ ' + item.line);
		});
		phantomas.addNotice();

	});
};
