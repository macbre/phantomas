/**
 * Analyzes jQuery activity
 *
 * @see http://code.jquery.com/jquery-1.10.2.js
 * @see http://code.jquery.com/jquery-2.0.3.js
 */
exports.version = '0.2';

exports.module = function(phantomas) {
        phantomas.setMetric('jQueryVersion', '');
        phantomas.setMetric('jQueryOnDOMReadyFunctions');
        phantomas.setMetric('jQuerySizzleCalls');

	// spy calls to jQuery functions
	phantomas.once('init', function() {
		phantomas.evaluate(function() {
			(function(phantomas) {
				var jQuery;

				// TODO: create a helper - phantomas.spyGlobalVar() ?
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

					// Sizzle calls - jQuery.find
					phantomas.spy(val, 'find', function(selector, context) {
						phantomas.log('Sizzle called: ' + selector + ' (context: ' + phantomas.getDOMPath(context) + ')');
						phantomas.incrMetric('jQuerySizzleCalls');
					});
				});

				window.__defineGetter__('jQuery', function() {
					return jQuery;
				});
			})(window.__phantomas);
		});
	});
};
