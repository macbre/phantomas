/**
 * Counts global JavaScript variables
 */
exports.version = '0.1';

exports.module = function(phantomas) {

	phantomas.on('report', function() {
		var globals = phantomas.evaluate(function() {
		return (function(phantomas) {
			var globals = [],
				allowed = ['Components','XPCNativeWrapper','XPCSafeJSObjectWrapper','getInterface','netscape','GetWeakReference', '_phantom', 'callPhantom', '__phantomas', 'performance'],
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

			phantomas.spyEnabled(true);

			cleanWindow = iframe.contentWindow;

			for (varName in cleanWindow) {
				allowed.push(varName);
			}

			// get all members of window and filter them
			for (varName in window) {
				if ( (allowed.indexOf(varName) > -1) || (typeof window[varName] === 'undefined') /* ignore variables exposed by window.__defineGetter__ */) {
					continue;
				}

				globals.push(varName);
			}

			return globals.sort();
		})(window.__phantomas);
		}) || [];

		phantomas.setMetric('globalVariables', globals.length);

		if (globals.length > 0) {
			phantomas.addOffender('globalVariables', globals.join(', '));
		}
	});
};
