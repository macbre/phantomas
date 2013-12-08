/**
 * Analyzes DOM complexity
 */
exports.version = '0.2';

exports.module = function(phantomas) {

	// HTML size
	phantomas.on('report', function() {
		phantomas.setMetricEvaluate('bodyHTMLSize', function() {
			return document.body && document.body.innerHTML.length || 0;
		});

		phantomas.evaluate(function() {
			(function(phantomas) {
				var runner = new phantomas.nodeRunner(),
					whitespacesRegExp = /^\s+$/;

				// include all nodes
				runner.isSkipped = function(node) {
					return false;
				};

				runner.walk(document.body, function(node, depth) {
					switch (node.nodeType) {
						case Node.COMMENT_NODE:
							phantomas.incr('commentsSize', node.textContent.length + 7); // '<!--' + '-->'.length
							break;

						case Node.ELEMENT_NODE:
							phantomas.incr('DOMelementsCount');
							phantomas.set('DOMelementMaxDepth', Math.max(phantomas.get('DOMelementMaxDepth') || 0, depth));

							// ignore inline <script> tags
							if (node.nodeName === 'SCRIPT') {
								return false;
							}

							// @see https://developer.mozilla.org/en/DOM%3awindow.getComputedStyle
							var styles = window.getComputedStyle(node),
								size = 0;

							if (styles && styles.getPropertyValue('display') === 'none') {
								if (typeof node.innerHTML === 'string') {
									size = node.innerHTML.length;
									phantomas.incr('hiddenContentSize', size);

									// log hidden containers bigger than 1 kB
									if (size > 1024) {
										phantomas.addOffender('hiddenContentSize', phantomas.getDOMPath(node) + ' (' + size + ' bytes)');
									}
								}

								// don't run for child nodes as they're hidden as well
								return false;
							}

							// count nodes with inline CSS
							if (node.hasAttribute('style')) {
								phantomas.incr('nodesWithInlineCSS');
							}

							break;

						case Node.TEXT_NODE:
							if (whitespacesRegExp.test(node.textContent)) {
								phantomas.incr('whiteSpacesSize', node.textContent.length);
							}
							break;
					}
				});

				phantomas.spyEnabled(false, 'counting iframes and images');

				// count <iframe> tags
				phantomas.setMetric('iframesCount', document.querySelectorAll('iframe').length);

				// <img> nodes without dimensions (one of width / height missing)
				phantomas.setMetric('imagesWithoutDimensions', (function() {
					var imgNodes = document.body && document.body.querySelectorAll('img') || [],
						node,
						imagesWithoutDimensions = 0;

					for (var i=0, len=imgNodes.length; i<len; i++) {
						node = imgNodes[i];
						if (!node.hasAttribute('width') || !node.hasAttribute('height')) {
							phantomas.log('Image without dimensions: ' + phantomas.getDOMPath(node));
							imagesWithoutDimensions++;
						}
					}

					return imagesWithoutDimensions;
				})());

				phantomas.spyEnabled(true);
			}(window.__phantomas));
		});

		// total length of HTML comments (including <!-- --> brackets)
		phantomas.setMetricFromScope('commentsSize');

		// total length of HTML of hidden elements (i.e. display: none)
		phantomas.setMetricFromScope('hiddenContentSize');

		// total length of text nodes with whitespaces only (i.e. pretty formatting of HTML)
		phantomas.setMetricFromScope('whiteSpacesSize');

		// count all tags
		phantomas.setMetricFromScope('DOMelementsCount');
		phantomas.setMetricFromScope('DOMelementMaxDepth');

		// nodes with inlines CSS (style attribute)
		phantomas.setMetricFromScope('nodesWithInlineCSS');
	});
};
