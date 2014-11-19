/**
 * Counts global JavaScript variables
 */
/* global document: true, window: true */
'use strict';

exports.version = '0.3';

exports.module = function(phantomas) {
	phantomas.setMetric('globalVariables'); // @desc number of JS globals variables @offenders
	phantomas.setMetric('globalVariablesFalsy'); // @desc number of JS globals variables with falsy value @offenders

	phantomas.on('report', function() {
		phantomas.evaluate(function() {
			(function(phantomas) {
				var globals = [],
					allowed = ['Components', 'XPCNativeWrapper', 'XPCSafeJSObjectWrapper', 'getInterface', 'netscape', 'GetWeakReference', '_phantom', 'callPhantom', '__phantomas', 'performance'],
					varName,
					iframe,
					cleanWindow;

				if (!document.body) {
					return false;
				}

				phantomas.spyEnabled(false, 'counting global variables (injecting an empty iframe)');

				// create an empty iframe to get the list of core members
				iframe = document.createElement('iframe');
				iframe.style.display = 'none';
				iframe.src = 'about:blank';
				document.body.appendChild(iframe);

				cleanWindow = iframe.contentWindow;

				for (varName in cleanWindow) {
					allowed.push(varName);
				}

				// get all members of window and filter them
				for (varName in window) {
					if ((allowed.indexOf(varName) > -1) || (typeof window[varName] === 'undefined') /* ignore variables exposed by window.__defineGetter__ */ ) {
						continue;
					}

					// filter out 0, 1, 2, ...
					if (/^\d+$/.test(varName)) {
						continue;
					}

					phantomas.incrMetric('globalVariables');
					phantomas.addOffender('globalVariables', varName);

					if ([false, null].indexOf(window[varName]) > -1) {
						phantomas.incrMetric('globalVariablesFalsy');
						phantomas.addOffender('globalVariablesFalsy', varName + ' = ' + JSON.stringify(window[varName]));
					}
				}

				// cleanup (issue #297)
				document.body.removeChild(iframe);

				phantomas.spyEnabled(true);
			})(window.__phantomas);
		});
	});
};
