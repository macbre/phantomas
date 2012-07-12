/**
 * Analyzes DOM queries done via native DOM methods & jQuery
 *
 */
exports.version = '0.1';

exports.module = function(phantomas) {

	// fake native DOM functions
	phantomas.on('init', function() {
		phantomas.evaluate(function() {
			(function() {
				var originalGetElementById = document.getElementById,
					originalGetElementsByClassName = document.getElementsByClassName;

				window.phantomas.domQueries = 0;
				window.phantomas.jQuerySelectors = 0;

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
						var selector = arguments[0];
						console.log('$(' + (typeof selector === 'string' ? '"' + selector + '"' : typeof selector) + ')');

						// count selectors and $ wrappers around body and window only
						if (typeof selector !== 'function') {
							window.phantomas.jQuerySelectors++;
						}

						return originalJQueryFnInit.apply(val.fn, arguments);
					};

					// Give the init function the jQuery prototype for later instantiation (taken from jQuery source)
					val.fn.init.prototype = val.fn;

					console.log('Mocked jQuery v' + val.fn.jquery + ' object');
				});

				window.__defineGetter__('jQuery', function() { return originalJQuery; });
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
	});
};
