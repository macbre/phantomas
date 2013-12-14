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
					var version;

					if (!val || !val.fn) {
						phantomas.log('jQuery: unable to detect version!');
						return;
					}

					version = val.fn.jquery;
					jQuery = val;

					phantomas.log('jQuery: loaded v' + version);
					phantomas.setMetric('jQueryVersion', version);

					// jQuery.ready.promise
					// works for jQuery 1.8.0+ (released Aug 09 2012)
					phantomas.spy(val.ready, 'promise', function() {
						phantomas.log('jQuery.ready called: from ' + phantomas.getCaller(3));
						phantomas.incrMetric('jQueryOnDOMReadyFunctions');
					}) || phantomas.log('jQuery: can not measure jQueryOnDOMReadyFunctions (jQuery used on the page is too old)!');

					// Sizzle calls - jQuery.find
					// works for jQuery 1.3+ (released Jan 13 2009)
					phantomas.spy(val, 'find', function(selector, context) {
						phantomas.log('Sizzle called: ' + selector + ' (context: ' + (phantomas.getDOMPath(context) || 'unknown') + ')');
						phantomas.incrMetric('jQuerySizzleCalls');
					}) || phantomas.log('jQuery: can not measure jQuerySizzleCalls (jQuery used on the page is too old)!');
				});

				window.__defineGetter__('jQuery', function() {
					return jQuery;
				});
			})(window.__phantomas);
		});
	});
};
