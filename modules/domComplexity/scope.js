(function(phantomas) {

    phantomas.spyEnabled(false, 'initializing domComplexity metrics');

    window.addEventListener('load', () => {
        phantomas.log("Page fully loaded and parsed");
        phantomas.spyEnabled(false, 'running domComplexity metrics');

        phantomas.setMetric('bodyHTMLSize', document.body && document.body.innerHTML.length || 0);

        // duplicated ID (issue #392)
        // DOMidDuplicated: [ { id: 'foo', count: 3 }, { id: 'bar', count: 2 } ]
        (() => {
            const nodes = document.querySelectorAll('*[id]'),
                ids = Array.prototype.slice.apply(nodes).map((node) => node.id);

            phantomas.emit('DOMids', ids);
        })();

        // count nodes with inline CSS
        // nodesWithInlineCSS: [ { path: 'p#foo', css: 'color: blue' } ]
        (() => {
            document.querySelectorAll('*[style]').forEach(node => {
                const path = phantomas.getDOMPath(node, true /* dontGoUpTheDom */ );

                phantomas.incrMetric('nodesWithInlineCSS');
                phantomas.addOffender('nodesWithInlineCSS', {path: path, css: node.getAttribute('style')});
            });
        })();

        // DOM complexity and various statistics
        (() => {
            var runner = new phantomas.nodeRunner(),
                whitespacesRegExp = /^\s+$/,
                DOMelementMaxDepth = 0,
                DOMelementMaxDepthNodes = [], // stores offenders for DOMelementMaxDepth (issue #414)
                size = 0;

            runner.walk(document.body, function(node, depth) {
                var path = '';

                switch (node.nodeType) {
                    case Node.COMMENT_NODE:
                        size = node.textContent.length + 7; // '<!--' + '-->'.length
                        phantomas.incrMetric('commentsSize', size);

                        // log HTML comments bigger than 64 characters
                        if (size > 64) {
                            phantomas.addOffender('commentsSize', {element: phantomas.getDOMPath(node), size});
                        }
                        break;

                    case Node.ELEMENT_NODE:
                        path = phantomas.getDOMPath(node);

                        phantomas.incrMetric('DOMelementsCount');

                        if (depth > DOMelementMaxDepth) {
                            DOMelementMaxDepth = depth;
                            DOMelementMaxDepthNodes = [path];
                        } else if (depth === DOMelementMaxDepth) {
                            DOMelementMaxDepthNodes.push(path);
                        }

                        // ignore inline <script> tags
                        if (node.nodeName === 'SCRIPT') {
                            return false;
                        }

                        // images
                        if (node.nodeName === 'IMG') {
                            var imgWidth = node.hasAttribute('width') ? parseInt(node.getAttribute('width'), 10) : false,
                                imgHeight = node.hasAttribute('height') ? parseInt(node.getAttribute('height'), 10) : false;

                            // get dimensions from inline CSS (issue #399)
                            if (imgWidth === false || imgHeight === false) {
                                imgWidth = parseInt(node.style.width, 10) || false;
                                imgHeight = parseInt(node.style.height, 10) || false;
                            }

                            if (imgWidth === false || imgHeight === false) {
                                phantomas.incrMetric('imagesWithoutDimensions');
                                phantomas.addOffender('imagesWithoutDimensions', '%s <%s>', path, node.src);
                            }

                            if (node.naturalHeight && node.naturalWidth && imgHeight && imgWidth) {
                                if (node.naturalHeight > imgHeight || node.naturalWidth > imgWidth) {
                                    phantomas.emit('imagesScaledDown', {
                                        url: node.src,
                                        naturalWidth:node.naturalWidth, naturalHeight: node.naturalHeight,
                                        imgWidth, imgHeight
                                    });
                                }
                            }
                        }

                        break;

                    case Node.TEXT_NODE:
                        if (whitespacesRegExp.test(node.textContent)) {
                            phantomas.incrMetric('whiteSpacesSize', node.textContent.length);
                        }
                        break;
                }
            });

            phantomas.setMetric('DOMelementMaxDepth', DOMelementMaxDepth);
            DOMelementMaxDepthNodes.forEach(function(path) {
                phantomas.addOffender('DOMelementMaxDepth', path);
            });
        })();

        // count <iframe> tags
        phantomas.setMetric('iframesCount', document.querySelectorAll('iframe').length); // @desc number of iframe nodes

        phantomas.spyEnabled(true);
    });

    phantomas.spyEnabled(true);

})(window.__phantomas);
