/**
 * Analyzes jQuery activity
 *
 * @see http://code.jquery.com/jquery-1.10.2.js
 * @see http://code.jquery.com/jquery-2.1.1.js
 */
/* global document: true, window: true */
'use strict';

exports.version = '0.2';

exports.module = function(phantomas) {
	phantomas.setMetric('jQueryVersion', ''); // @desc version of jQuery framework (if loaded) [string]
	phantomas.setMetric('jQueryOnDOMReadyFunctions'); // @desc number of functions bound to onDOMReady event
	phantomas.setMetric('jQuerySizzleCalls'); // @desc number of calls to Sizzle (including those that will be resolved using querySelectorAll)

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
						phantomas.incrMetric('jQueryOnDOMReadyFunctions');
						phantomas.addOffender('jQueryOnDOMReadyFunctions', phantomas.getCaller(3));
					}) || phantomas.log('jQuery: can not measure jQueryOnDOMReadyFunctions (jQuery used on the page is too old)!');

					// Sizzle calls - jQuery.find
					// works for jQuery 1.3+ (released Jan 13 2009)
					phantomas.spy(val, 'find', function(selector, context) {
						phantomas.incrMetric('jQuerySizzleCalls');
						phantomas.addOffender('jQuerySizzleCalls', '%s (in %s)', selector, (phantomas.getDOMPath(context) || 'unknown'));
					}) || phantomas.log('jQuery: can not measure jQuerySizzleCalls (jQuery used on the page is too old)!');
				});

				window.__defineGetter__('jQuery', function() {
					return jQuery;
				});
			})(window.__phantomas);
		});
	});
};
