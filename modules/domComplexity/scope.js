(function(phantomas) {

    document.addEventListener("DOMContentLoaded", () => {
        phantomas.log("DOM fully loaded and parsed");
        phantomas.spyEnabled(false, 'running domComplexity metrics');

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

        phantomas.spyEnabled(true);
    });

})(window.__phantomas);
