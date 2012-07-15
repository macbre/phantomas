/**
 * Analyzes DOM complexity
 *
 * Uses dom-monster bookmarklet
 *
 * @see http://mir.aculo.us/dom-monster
 * @see https://github.com/madrobby/dom-monster
 */
exports.version = '0.1';

exports.module = function(phantomas) {

	// inject DOM Monster
	phantomas.on('report', function() {
		var injectRes = phantomas.injectJs('./lib/dommonster.js');
		phantomas.log(injectRes ? 'DOM monster injected' : 'Unable to inject DOM monster!');
	});

	// JS global variables
	phantomas.on('report', function() {
		var globalVariables = phantomas.evaluate(function() {
			return JR.globals() || [];
		});

		phantomas.setMetric('globalVariables', globalVariables.length);
		phantomas.addNotice('JavaScript globals (' + (globalVariables.length) + '): ' + globalVariables.join(', '));
		phantomas.addNotice();
	});

	// HTML size
	phantomas.on('report', function() {
		phantomas.setMetricEvaluate('bodyHTMLSize', function() {
			return document.body.innerHTML.length;
		});

		phantomas.evaluate(function() {
			(function(phantomas) {
				var runner = new phantomas.nodeRunner(),
					whitespacesRegExp = /^\s+$/;

				var metrics = {
					comments: 0,
					whitespaces: 0
				};

				// include all nodes
				runner.isSkipped = function(node) {
					return false;
				};

				runner.walk(document.body, function(node) {
					switch (node.nodeType) {
						case Node.COMMENT_NODE:
							metrics.comments += node.textContent.length + 7; // '<!--' + '-->'.length
							break;

						case Node.TEXT_NODE:
							if (whitespacesRegExp.test(node.textContent)) {
								metrics.whitespaces += node.textContent.length;
							}
							break;
					}
				});

				// store metrics
				phantomas.DOMmetrics = metrics;

			}(window.phantomas));
		});

		phantomas.setMetricEvaluate('commentsSize', function() {
			return window.phantomas.DOMmetrics.comments;
		});

		phantomas.setMetricEvaluate('whiteSpacesSize', function() {
			return window.phantomas.DOMmetrics.whitespaces;
		});

	});
};
