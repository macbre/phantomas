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
	phantomas.setMetric('jQueryEventTriggers'); // @desc number of jQuery event triggers

	// spy calls to jQuery functions
	phantomas.once('init', function() {
		phantomas.evaluate(function() {
			(function(phantomas) {
				phantomas.spyGlobalVar('jQuery', function(jQuery) {
					var version;

					if (!jQuery || !jQuery.fn) {
						phantomas.log('jQuery: unable to detect version!');
						return;
					}

					version = jQuery.fn.jquery;

					phantomas.log('jQuery: loaded v' + version);
					phantomas.setMetric('jQueryVersion', version);

					// jQuery.ready.promise
					// works for jQuery 1.8.0+ (released Aug 09 2012)
					phantomas.spy(jQuery.ready, 'promise', function() {
						phantomas.incrMetric('jQueryOnDOMReadyFunctions');
						phantomas.addOffender('jQueryOnDOMReadyFunctions', phantomas.getCaller(3));
					}) || phantomas.log('jQuery: can not measure jQueryOnDOMReadyFunctions (jQuery used on the page is too old)!');

					// Sizzle calls - jQuery.find
					// works for jQuery 1.3+ (released Jan 13 2009)
					phantomas.spy(jQuery, 'find', function(selector, context) {
						phantomas.incrMetric('jQuerySizzleCalls');
						phantomas.addOffender('jQuerySizzleCalls', '%s (in %s)', selector, (phantomas.getDOMPath(context) || 'unknown'));
					}) || phantomas.log('jQuery: can not measure jQuerySizzleCalls (jQuery used on the page is too old)!');

					// jQuery events triggers (issue #440)
					phantomas.spy(jQuery.event, 'trigger', function(ev, data, elem) {
						var path = phantomas.getDOMPath(elem),
							type = ev.type || ev;

						phantomas.log('Event: triggered "%s" on "%s"', type, path);

						phantomas.incrMetric('jQueryEventTriggers');
						phantomas.addOffender('jQueryEventTriggers', '"%s" on "%s"', type, path);
					});
				});
			})(window.__phantomas);
		});
	});
};
