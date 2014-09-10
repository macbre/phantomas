/**
 * Analyzes DOM hidden content
 */
/* global document: true, Node: true, window: true */
'use strict';

exports.version = '0.1';

exports.module = function(phantomas) {

	// total length of HTML of hidden elements (i.e. display: none)
	phantomas.setMetric('hiddenContentSize'); // @desc the size of content of hidden elements on the page (with CSS display: none) @offenders

	// HTML size
	phantomas.on('report', function() {
		phantomas.evaluate(function() {
			(function(phantomas) {
				var runner = new phantomas.nodeRunner();

				runner.walk(document.body, function(node, depth) {
					switch (node.nodeType) {
						case Node.ELEMENT_NODE:
							// @see https://developer.mozilla.org/en/DOM%3awindow.getComputedStyle
							var styles = window.getComputedStyle(node);

							if (styles && styles.getPropertyValue('display') === 'none') {
								if (typeof node.innerHTML === 'string') {
									var size = node.innerHTML.length;
									phantomas.incrMetric('hiddenContentSize', size);

									// log hidden containers bigger than 1 kB
									if (size > 1024) {
										phantomas.addOffender('hiddenContentSize', phantomas.getDOMPath(node) + ' (' + size + ' characters)');
									}
								}

								// don't run for child nodes as they're hidden as well
								return false;
							}
							break;
					}
				});

			}(window.__phantomas));
		});
	});
};
