/**
 * Analyzes DOM complexity
 */
exports.version = '0.2';

exports.module = function(phantomas) {

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
					nodes: 0,
					comments: 0,
					hiddenContent: 0,
					whitespaces: 0,
					maxDepth: 0,
					nodesWithCSS: 0
				};

				// include all nodes
				runner.isSkipped = function(node) {
					return false;
				};

				runner.walk(document.body, function(node, depth) {
					switch (node.nodeType) {
						case Node.COMMENT_NODE:
							metrics.comments += node.textContent.length + 7; // '<!--' + '-->'.length
							break;

						case Node.ELEMENT_NODE:
							metrics.nodes++;
							metrics.maxDepth = Math.max(metrics.maxDepth, depth);

							// ignore inline <script> tags
							if (node.nodeName === 'SCRIPT') {
								return false;
							}

							// @see https://developer.mozilla.org/en/DOM%3awindow.getComputedStyle
							var styles = window.getComputedStyle(node);

							if (styles && styles.getPropertyValue('display') === 'none') {
								//console.log(node.innerHTML);
								metrics.hiddenContent += node.innerHTML.length;

								// don't run for child nodes as they're hidden as well
								return false;
							}

							// count nodes with inline CSS
							if (node.hasAttribute('style')) {
								metrics.nodesWithCSS++;
							}

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

		// total length of HTML comments (including <!-- --> brackets)
		phantomas.setMetricEvaluate('commentsSize', function() {
			return window.phantomas.DOMmetrics.comments;
		});

		// total length of HTML of hidden elements (i.e. display: none)
		phantomas.setMetricEvaluate('hiddenContentSize', function() {
			return window.phantomas.DOMmetrics.hiddenContent;
		});

		// total length of text nodes with whitespaces only (i.e. pretty formatting of HTML)
		phantomas.setMetricEvaluate('whiteSpacesSize', function() {
			return window.phantomas.DOMmetrics.whitespaces;
		});

		// count all tags
		phantomas.setMetricEvaluate('DOMelementsCount', function() {
			return window.phantomas.DOMmetrics.nodes;
		});

		phantomas.setMetricEvaluate('DOMelementMaxDepth', function() {
			return window.phantomas.DOMmetrics.maxDepth;
		});

		// count <iframe> tags
		phantomas.setMetricEvaluate('iframesCount', function() {
			return document.querySelectorAll('iframe').length;
		});

		// nodes with inlines CSS (style attribute)
		phantomas.setMetricEvaluate('nodesWithInlineCSS', function() {
			return window.phantomas.DOMmetrics.nodesWithCSS;
		});

		// <img> nodes without dimensions (one of width / height missing)
		phantomas.setMetricEvaluate('imagesWithoutDimensions', function() {
			var imgNodes = document.body.querySelectorAll('img'),
				node,
				imagesWithoutDimensions = 0;

			for (i=0, len=imgNodes.length; i<len; i++) {
				node = imgNodes[i];
				if (!node.hasAttribute('width') || !node.hasAttribute('height')) {
					imagesWithoutDimensions++;
				}
			};

			return imagesWithoutDimensions;
		});
	});
};
