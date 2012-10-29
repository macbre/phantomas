/**
 * Counts global JavaScript variables
 */
exports.version = '0.1';

exports.module = function(phantomas) {

	phantomas.on('report', function() {
		var globals = phantomas.evaluate(function() {
			var globals = [],
		    		allowed = ['Components','XPCNativeWrapper','XPCSafeJSObjectWrapper','getInterface','netscape','GetWeakReference', '_phantom', 'callPhantom', 'phantomas'],
		    		varName,
		    		iframe,
		    		cleanWindow;

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
				if (allowed.indexOf(varName) > -1) {
					continue;
				}

				globals.push(varName);
			}

			return globals;
		}) || [];

		phantomas.setMetric('globalVariables', globals.length);
		phantomas.addNotice('JavaScript globals (' + globals.length + '): ' + globals.join(', '));
		phantomas.addNotice();
	});
};
