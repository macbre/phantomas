/**
 * phantomas browser "scope" with helper code
 *
 * Code below is executed in page's "scope" (injected by onInitialized() in core/phantomas.js)
 */
(function(scope) {
	'use strict';

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
				childNodes = node && node.childNodes || [];

			depth = (depth || 1);

			for (var n = 0, len = childNodes.length; n < len; n++) {
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
	(function() {
		// @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/Stack
		function getStackFromError(e) {
			var stack = e.stack.trim().split("\n").
			map(function(item) {
				return item.replace(/^(\s+at\s|@)/, '').trim();
			}).
			filter(function(item) {
				return /:\d+\)?$/.test(item);
			});

			//console.log(stack);
			return stack;
		}

		function getBacktrace() {
			var stack = [];

			try {
				throw new Error('backtrace');
			} catch (e) {
				stack = getStackFromError(e).slice(3);
			}

			return stack.join(' / ');
		}

		function getCaller(stepBack) {
			var caller = false;

			stepBack = stepBack || 0;

			try {
				throw new Error('backtrace');
			} catch (e) {
				caller = getStackFromError(e)[3 + stepBack];
			}

			return caller;
		}

		phantomas.getBacktrace = getBacktrace;
		phantomas.getCaller = getCaller;
	})();

	// communication with phantomas core
	(function() {
		var stringify = JSON.stringify,
			origConsoleLog = console.log;

		// overrride console.log (issue #69)
		console.log = function() {
			// pass all arguments as an array, let phantomas format them
			// @see https://developer.mozilla.org/en-US/docs/Web/API/console

			// avoid 'TypeError: JSON.stringify cannot serialize cyclic structures.'
			try {
				origConsoleLog.call(console, 'log:' + stringify(Array.prototype.slice.call(arguments)));
			} catch (e) {}
		};

		// now "freeze" the console object (issue #230)
		// @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze
		Object.freeze(console);

		function sendMsg(type, data) {
			// @see https://github.com/ariya/phantomjs/wiki/API-Reference-WebPage#oncallback
			// Stability: EXPERIMENTAL - see issue #62
			/**
			if (typeof window.callPhantom === 'function') {
				window.callPhantom({type: type, data: data});
			}
			**/

			try {
				origConsoleLog.call(console, 'msg:' + stringify({
					type: type || false,
					data: data || false
				}));
			} catch (e) {
				throw new Error('phantomas: calling native console.log() failed ("' + e + '")!');
			}
		}

		function log() {
			sendMsg('log', Array.prototype.slice.apply(arguments));
		}

		function setMetric(name, value, isFinal) {
			sendMsg('setMetric', {
				name: name,
				value: (typeof value !== 'undefined') ? value : 0,
				isFinal: isFinal === true
			});
		}

		function incrMetric(name, incr /* =1 */ ) {
			sendMsg('incrMetric', {
				name: name,
				incr: incr || 1
			});
		}

		function setMarkerMetric(name) {
			sendMsg('setMarkerMetric', {
				name: name
			});
		}

		function addOffender( /*metricName, msg, ...*/ ) {
			sendMsg('addOffender', Array.prototype.slice.apply(arguments));
		}

		function emit( /* eventName, arg1, arg2, ... */ ) {
			sendMsg('emit', Array.prototype.slice.apply(arguments));
		}

		// exports
		phantomas.log = log;
		phantomas.setMetric = setMetric;
		phantomas.incrMetric = incrMetric;
		phantomas.setMarkerMetric = setMarkerMetric;
		phantomas.addOffender = addOffender;
		phantomas.emit = emit;
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
	(function() {
		var enabled = true;

		// turn off spying to not include internal phantomas actions
		function spyEnabled(state, reason) {
			enabled = (state === true);

			phantomas.log('Spying ' + (enabled ? 'enabled' : 'disabled') + (reason ? ' - ' + reason : ''));
		}

		// pass reportResults = true to prepend arguments passed to callback
		// with the result of call to the original function - issue #420
		function spy(obj, fn, callback, reportResults) {
			var origFn = obj[fn];

			if (typeof origFn !== 'function') {
				return false;
			}

			phantomas.log('Attaching a spy to "' + fn + '" function%s...', (reportResults ? ' with results reporting' : ''));

			obj[fn] = function() {
				var args = Array.prototype.slice.call(arguments),
					results = origFn.apply(this, args);

				if (enabled && typeof callback === 'function') {
					callback.apply(this, (reportResults === true) ? [results].concat(args) : args);
				}

				return results;
			};

			// copy custom properties of original function to the mocked one
			Object.keys(origFn).forEach(function(key) {
				obj[fn][key] = origFn[key];
			});

			obj[fn].prototype = origFn.prototype;

			return true;
		}

		// exports
		phantomas.spy = spy;
		phantomas.spyEnabled = spyEnabled;
	})();

	/**
	 * Returns "DOM path" to a given node (starting from <body> down to the node)
	 *
	 * Example: body.logged_out.vis-public.env-production > div > div
	 */
	function getDOMPath(node, dontGoUpTheDom /* = false */ ) {
		var path = [],
			entry = '';

		if (node === window) {
			return 'window';
		}

		while (node instanceof Node) {
			// div
			entry = node.nodeName.toLowerCase();

			// shorten the path a bit
			if (['body', 'head', 'html'].indexOf(entry) > -1) {
				path.push(entry);
				break;
			}

			if (node instanceof DocumentFragment) {
				entry = 'DocumentFragment';
			}

			// div#foo
			if (node.id && node.id !== '') {
				entry += '#' + node.id;
			}
			// div#foo.bar.test
			else if (typeof node.className === 'string' && node.className !== '') {
				entry += '.' + node.className.trim().replace(/ +/g, '.');
			}
			// div[0] <- index of child node
			else if (node.parentNode instanceof Node) {
				entry += '[' + Array.prototype.indexOf.call(node.parentNode.childNodes, node) + ']';
			}

			path.push(entry);

			if (dontGoUpTheDom === true) {
				break;
			}

			// go up the DOM
			node = node && node.parentNode;
		}

		return (path.length > 0) ? path.reverse().join(' > ') : false;
	}

	// exports
	phantomas.getDOMPath = getDOMPath;
	phantomas.nodeRunner = nodeRunner;

	phantomas.log('phantomas scope injected');
})(window);
