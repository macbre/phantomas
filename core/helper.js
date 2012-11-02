/**
 * phantomas helper code
 *
 * Executed in page window
 */

(function(window) {

	// NodeRunner
	var nodeRunner = function() {
		// "Beep, Beep"
	};

	nodeRunner.prototype = {
		// call callback for each child of node
		walk: function(node, callback, depth) {
			if (this.isSkipped(node)) {
				return;
			}

			var childNode,
				childNodes = node.childNodes || [];

			depth = (depth || 1);

			for (var n=0, len = childNodes.length; n < len; n++) {
				childNode = childNodes[n];

				// callback can return false to stop recursive
				if (callback(childNode, depth) !== false) {
					this.walk(childNode, callback, depth + 1);
				}
			}
		},

		// override this function when you create an object of class phantomas.nodeRunner
		// by default only iterate over HTML elements
		isSkipped: function(node) {
			return !node || (node.nodeType !== Node.ELEMENT_NODE);
		}
	};

	function getCaller() {
		var caller = {};

		try {
			throw new Error('backtrace');
		} catch(e) {
			caller = (e.stackArray && e.stackArray[3]) || {};
		}

		return caller;
	}

	// create a scope
	var phantomas = (window.phantomas = window.phantomas || {});

	// exports
	phantomas.nodeRunner = nodeRunner;
	phantomas.getCaller = getCaller;

	console.log('phantomas scope injected');

})(window);
