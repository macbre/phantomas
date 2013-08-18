/**
 * phantomas browser "scope" with helper code
 *
 * Code below is executed in page's "scope" (injected by onInitialized() in core/phantomas.js)
 */
(function(scope) {
	// create a scope
	var phantomas = (scope.__phantomas = scope.__phantomas || {});

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

	// for backtraces
	function getCaller() {
		var caller = {};

		try {
			throw new Error('backtrace');
		} catch(e) {
			caller = (e.stackArray && e.stackArray[3]) || {};
		}

		return caller;
	}

	// setters / getters used to pass values to phantomas modules
	(function() {
		var storage = {};

		function set(key, val) {
			storage[key] = val;
		}

		function incr(key, incrBy /* =1 */) {
			storage[key] = (storage[key] || 0) + (incrBy || 1);
		}

		function get(key) {
			return storage[key];
		}

		// exports
		phantomas.set = set;
		phantomas.incr = incr;
		phantomas.get = get;
	})();

	// communication with phantomas core
	(function() {
		// @see https://github.com/ariya/phantomjs/wiki/API-Reference-WebPage#oncallback
		function sendMsg(type, data) {
			if (typeof window.callPhantom === 'function') {
				window.callPhantom({type: type, data: data});
			}
		}

		function log(msg) {
			sendMsg('log', msg);
		}

		function setMetric(name, value) {
			sendMsg('setMetric', {name: name, value: (typeof value !== 'undefined') ? value : 0});
		}

		function incrMetric(name, incr /* =1 */) {
			sendMsg('incrMetric', {name: name, incr: incr || 1});
		}

		// exports
		phantomas.log = log;
		phantomas.setMetric = setMetric;
		phantomas.incrMetric = incrMetric;
	})();

	/**
	 * Proxy function to be used to track calls to native DOM functions
	 *
	 * Callback is provided with arguments original function was called with
	 *
	 * Example:
	 *
	 *   window.__phantomas.proxy(window.document, 'getElementById', function() {
	 *     // ...
	 *   });
	 */
	function spy(obj, fn, callback) {
		var origFn = obj[fn];

		obj[fn] = function() {
			callback.apply(this, arguments);
			return origFn.apply(this, arguments);
		};
	}

	/**
	 * Returns "DOM path" to a given node (starting from <body> down to the node)
	 *
	 * Example: body.logged_out.vis-public.env-production > div > div
	 */
	function getDOMPath(node) {
		var path = [],
			entry;

		if (!node instanceof Node) {
			return false;
		}

		do {
			// div
			entry = node.nodeName.toLowerCase();

			// shorten the path a bit
			if (['body', 'head', 'html'].indexOf(entry) > -1) {
				path.push(entry);
				break;
			}

			// div#foo
			if (node.id && node.id !== '') {
				entry += '#' + node.id;
			}
			// div#foo.bar.test
			else if (node.className && node.className !== '') {
				entry += '.' + node.className.trim().replace(/ +/g, '.');
			}

			path.push(entry);

			// go up the DOM
			node = node && node.parentNode;
		} while(node);

		return path.reverse().join(' > ');
	}

	// exports
	phantomas.getCaller = getCaller;
	phantomas.getDOMPath = getDOMPath;
	phantomas.nodeRunner = nodeRunner;
	phantomas.spy = spy;

	phantomas.log('phantomas scope injected');
})(window);
