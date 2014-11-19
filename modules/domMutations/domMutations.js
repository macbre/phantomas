/**
 * Analyzes DOM changes via MutationObserver API
 *
 * These metrics are only available when running phantomas using Gecko engine (--engine=gecko)
 *
 * @see http://dev.opera.com/articles/mutation-observers-tutorial/
 */
/* global window: true, document: true, MutationObserver: true */
'use strict';

exports.version = '0.1';

exports.module = function(phantomas) {
	// SlimerJS only metrics
	phantomas.setMetric('DOMmutationsInserts'); // @desc number of <body> node inserts @gecko
	phantomas.setMetric('DOMmutationsRemoves'); // @desc number of <body> node removes @gecko
	phantomas.setMetric('DOMmutationsAttributes'); // @desc number of DOM nodes attributes changes @gecko

	phantomas.once('init', function() {
		phantomas.evaluate(function() {
			(function(phantomas) {
				if ('MutationObserver' in window) {
					// wait for DOM ready
					document.addEventListener('readystatechange', function() {
						if (document.readyState !== 'interactive') {
							return;
						}

						phantomas.log('DOM query: setting up MutationObserver...');

						var observer = new MutationObserver(function(allmutations) {
							allmutations.map(function(mutation) {
								// @see https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver#MutationRecord
								var targetPath = phantomas.getDOMPath(mutation.target, true /* dontGoUpTheDom */ );

								switch (mutation.type) {
									case 'attributes':
										phantomas.log('DOM mutation: "%s" attr (was "%s") set on %s',
											mutation.attributeName,
											mutation.oldValue || '',
											targetPath
										);

										phantomas.incrMetric('DOMmutationsAttributes');
										phantomas.addOffender('DOMmutationsAttributes', '"%s" attr set on %s', mutation.attributeName, targetPath);
										break;

									case 'childList':
										var wereAdded = (mutation.addedNodes.length > 0),
											nodes = wereAdded ? mutation.addedNodes : mutation.removedNodes,
											nodePath;

										for (var n = 0, nodesLen = nodes.length; n < nodesLen; n++) {
											nodePath = phantomas.getDOMPath(nodes[n], true /* dontGoUpTheDom */ );

											phantomas.log('DOM mutation: node "%s" %s "%s"',
												nodePath,
												wereAdded ? 'added to' : 'removed from',
												targetPath
											);

											if (wereAdded) {
												phantomas.incrMetric('DOMmutationsInserts');
												phantomas.addOffender('DOMmutationsInserts', '"%s" added to "%s"', nodePath, targetPath);
											} else {
												phantomas.incrMetric('DOMmutationsRemoves');
												phantomas.addOffender('DOMmutationsRemoves', '"%s" removed from "%s"', nodePath, targetPath);
											}
										}
										break;

									default:
										phantomas.log('DOM mutation: %s', mutation.type);
								}
							});
						});

						observer.observe(document.body, {
							childList: true,
							attributes: true,
							characterData: true,
							subtree: true,
							attributeOldValue: true
						});
					});
				} else {
					phantomas.log('DOM query: MutationObserver not available!');
				}
			})(window.__phantomas);
		});
	});
};
