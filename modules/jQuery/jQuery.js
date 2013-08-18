/**
 * Analyzes jQuery activity
 */
exports.version = '0.1';

exports.module = function(phantomas) {
        phantomas.setMetric('jQueryVersion', '');
        //phantomas.setMetric('jQuerySelectors');
        phantomas.setMetric('jQueryOnDOMReadyFunctions');

	// fake native DOM functions
	phantomas.once('init', function() {
		phantomas.evaluate(function() {
			(function(phantomas) {
				// hook into $.fn.init to catch DOM queries
				/**
				var jQueryPolling = setInterval(function() {
					if (typeof window.jQuery !== 'undefined') {
						phantomas.log('jQuery: loaded v' + window.jQuery.fn.jquery);

						phantomas.spy(window.jQuery.fn, 'init', function(selector, context, rootjQuery) {
							phantomas.log('jQuery called ' + (typeof selector));
						});

						clearInterval(jQueryPolling);
					}
				}, 50);
				**/
				var jQuery;

				window.__defineSetter__('jQuery', function(val) {
					var version = val.fn.jquery;
					jQuery = val;

					phantomas.log('jQuery: loaded v' + version);
					phantomas.setMetric('jQueryVersion', version);

					// jQuery.ready.promise
					phantomas.spy(val.ready, 'promise', function() {
						phantomas.log('jQuery.ready called: from ' + phantomas.getCaller(3));
						phantomas.incrMetric('jQueryOnDOMReadyFunctions');
					});
				});

				window.__defineGetter__('jQuery', function() {
					return jQuery;
				});
			})(window.__phantomas);
		});
	});
};
