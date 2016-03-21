/**
 * Analyzes jQuery activity
 *
 * @see http://code.jquery.com/jquery-1.10.2.js
 * @see http://code.jquery.com/jquery-2.1.1.js
 */
/* global document: true, window: true */
'use strict';

exports.version = '1.0';

exports.module = function(phantomas) {
	var lastUrl;

	phantomas.setMetric('jQueryVersion', ''); // @desc version of jQuery framework (if loaded) [string]
	phantomas.setMetric('jQueryVersionsLoaded'); // @desc number of loaded jQuery "instances" (even in the same version)
	phantomas.setMetric('jQueryOnDOMReadyFunctions'); // @desc number of functions bound to onDOMReady event
	phantomas.setMetric('jQueryWindowOnLoadFunctions'); // @desc number of functions bound to windowOnLoad event
	phantomas.setMetric('jQuerySizzleCalls'); // @desc number of calls to Sizzle (including those that will be resolved using querySelectorAll)
	phantomas.setMetric('jQueryEventTriggers'); // @desc number of jQuery event triggers
	phantomas.setMetric('jQueryDOMReads'); // @desc number of DOM read operations
	phantomas.setMetric('jQueryDOMWrites'); // @desc number of DOM write operations
	phantomas.setMetric('jQueryDOMWriteReadSwitches'); // @desc number of read operations that follow a series of write operations (will cause repaint and can cause reflow)

	// spy calls to jQuery functions
	phantomas.on('init', function() {
		phantomas.evaluate(function() {
			(function(phantomas) {
				// read & write DOM operations (issue #436)
				function spyReadsAndWrites(jQuery) {
					var TYPE_SET = 'write',
						TYPE_GET = 'read';

					function report(type, funcName, context, args) {
						var caller = phantomas.getCaller(1),
							contextPath = phantomas.getDOMPath(context);

						args = (typeof args !== 'undefined') ? Array.prototype.slice.apply(args) : undefined;

						phantomas.emit('jQueryOp', type, funcName, args, contextPath, caller);
					}

					// "complex" getters and setters
					[
						'attr',
						'css',
						'prop',
					].forEach(function(funcName) {
						phantomas.spy(jQuery.fn, funcName, function(propName, val) {
							// setter when called with two arguments or provided with key/value set
							var isSet = (typeof val !== 'undefined') || (propName.toString() === '[object Object]');
							report(isSet ? TYPE_SET : TYPE_GET, funcName, this[0], arguments);
						});
					});

					// simple getters and setters
					[
						'height',
						'innerHeight',
						'innerWidth',
						'offset',
						'outerHeight',
						'outerWidth',
						'text',
						'width',
						'scrollLeft',
						'scrollTop'
					].forEach(function(funcName) {
						phantomas.spy(jQuery.fn, funcName, function(val) {
							// setter when called with an argument
							var isSet = (typeof val !== 'undefined');
							report(isSet ? TYPE_SET : TYPE_GET, funcName, this[0], arguments);
						});
					});

					// setters
					[
						'addClass',
						'removeAttr',
						'removeClass',
						'removeProp',
						'toggleClass',
					].forEach(function(funcName) {
						phantomas.spy(jQuery.fn, funcName, function(val) {
							report(TYPE_SET, funcName, this[0], [val]);
						});
					});
					// getters
					[
						'hasClass',
						'position',
					].forEach(function(funcName) {
						phantomas.spy(jQuery.fn, funcName, function(val) {
							report(TYPE_GET, funcName, this[0], arguments);
						});
					});
				}

				phantomas.spyGlobalVar('jQuery', function(jQuery) {
					var version;

					if (!jQuery || !jQuery.fn) {
						phantomas.log('jQuery: unable to detect version!');
						return;
					}

					// Tag the current version of jQuery to avoid multiple reports of jQuery being loaded
					// when it's actually only restored via $.noConflict(true) - see comments in #435
					if (jQuery.__phantomas === true) {
						phantomas.log('jQuery: this instance has already been seen by phantomas');
						return;
					}
					jQuery.__phantomas = true;

					// report the version of jQuery
					version = jQuery.fn.jquery;
					phantomas.emit('jQueryLoaded', version);

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
					}) || phantomas.log('jQuery: can not measure jQueryEventTriggers (jQuery used on the page is too old)!');

					// jQuery events bound to window' onLoad event (#451)
					phantomas.spy(jQuery.fn, 'on', function(eventName) {
						if ((eventName === 'load') && (this[0] === window)) {
							phantomas.incrMetric('jQueryWindowOnLoadFunctions');
							phantomas.addOffender('jQueryWindowOnLoadFunctions', phantomas.getCaller(2));
						}
					}) || phantomas.log('jQuery: can not measure jQueryWindowOnLoadFunctions (jQuery used on the page is too old)!');

					spyReadsAndWrites(jQuery);
				});
			})(window.__phantomas);
		});
	});

	// store the last resource that was received
	// try to report where given jQuery version was loaded from
	phantomas.on('recv', function(entry) {
		if (entry.isJS) {
			lastUrl = entry.url;
		}
	});

	phantomas.on('jQueryLoaded', function(version) {
		phantomas.log('jQuery: loaded v' + version);
		phantomas.setMetric('jQueryVersion', version);

		// report multiple jQuery "instances" (issue #435)
		phantomas.incrMetric('jQueryVersionsLoaded');
		phantomas.addOffender('jQueryVersionsLoaded', 'v%s', version);

		phantomas.log('jQuery: v%s (probably loaded from <%s>)', version, lastUrl);
	});

	// jQuery read & write operations (issue #436)
	var lastOp;

	phantomas.on('jQueryOp', function(type, funcName, args, contextPath, caller) {
		phantomas.log('jQuery: %s op from $.%s(%j) on "%s" - %s', type, funcName, args, contextPath, caller);

		if (type === 'read') {
			phantomas.incrMetric('jQueryDOMReads');
			phantomas.addOffender('jQueryDOMReads', '$.%s(%j) on "%s"', funcName, args, contextPath);

			// This read operation may follow a write operation
			// In this case browser needs to perform all buffered write operations
			// in order to update the DOM - this can cause repaints and reflows
			if (lastOp === 'write') {
				phantomas.incrMetric('jQueryDOMWriteReadSwitches');
				phantomas.addOffender('jQueryDOMWriteReadSwitches', 'before $.%s(%j) on "%s"', funcName, args, contextPath);
			}
		} else {
			phantomas.incrMetric('jQueryDOMWrites');
			phantomas.addOffender('jQueryDOMWrites', '$.%s(%j) on "%s"', funcName, args, contextPath);
		}

		lastOp = type;
	});
};
