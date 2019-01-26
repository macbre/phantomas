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
                            phantomas.addOffender('DOMmutationsAttributes', {attribute: mutation.attributeName, node: targetPath});
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
                                    phantomas.addOffender('DOMmutationsInserts', {node: nodePath, target: targetPath});
                                } else {
                                    phantomas.incrMetric('DOMmutationsRemoves');
                                    phantomas.addOffender('DOMmutationsRemoves', {node: nodePath, target: targetPath});
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