(function domComplexityScope(phantomas) {
  phantomas.spyEnabled(false, "initializing domComplexity metrics");

  window.addEventListener("load", () => {
    phantomas.log("Page fully loaded and parsed");
    phantomas.spyEnabled(false, "running domComplexity metrics");

    phantomas.setMetric(
      "bodyHTMLSize",
      (document.body && document.body.innerHTML.length) || 0
    );

    // duplicated ID (issue #392)
    // DOMidDuplicated: [ { id: 'foo', count: 3 }, { id: 'bar', count: 2 } ]
    (() => {
      const nodes = document.querySelectorAll("*[id]"),
        ids = Array.prototype.slice.apply(nodes).map((node) => node.id);

      phantomas.emit("DOMids", ids);
    })();

    // count nodes with inline CSS
    // nodesWithInlineCSS: [ { path: 'p#foo', css: 'color: blue' } ]
    (() => {
      document.querySelectorAll("*[style]").forEach((node) => {
        const path = phantomas.getDOMPath(node, true /* dontGoUpTheDom */);

        phantomas.incrMetric("nodesWithInlineCSS");
        phantomas.addOffender("nodesWithInlineCSS", {
          node: path,
          css: node.getAttribute("style"),
        });
      });
    })();

    // DOM complexity and various statistics
    (() => {
      var runner = new phantomas.nodeRunner(),
        whitespacesRegExp = /^\s+$/,
        DOMelementMaxDepth = 0,
        DOMelementMaxDepthNodes = [], // stores offenders for DOMelementMaxDepth (issue #414)
        size = 0;

      runner.walk(document.body, function (node, depth) {
        var path = "";

        switch (node.nodeType) {
          case Node.COMMENT_NODE:
            size = node.textContent.length + 7; // '<!--' + '-->'.length
            phantomas.incrMetric("commentsSize", size);

            // log HTML comments bigger than 64 characters
            if (size > 64) {
              phantomas.addOffender("commentsSize", {
                element: phantomas.getDOMPath(node),
                size,
              });
            }
            break;

          case Node.ELEMENT_NODE:
            path = phantomas.getDOMPath(node);

            phantomas.incrMetric("DOMelementsCount");

            if (depth > DOMelementMaxDepth) {
              DOMelementMaxDepth = depth;
              DOMelementMaxDepthNodes = [path];
            } else if (depth === DOMelementMaxDepth) {
              DOMelementMaxDepthNodes.push(path);
            }

            // ignore inline <script> tags
            if (node.nodeName === "SCRIPT") {
              return false;
            }

            break;

          case Node.TEXT_NODE:
            if (whitespacesRegExp.test(node.textContent)) {
              phantomas.incrMetric("whiteSpacesSize", node.textContent.length);
            }
            break;
        }
      });

      phantomas.setMetric("DOMelementMaxDepth", DOMelementMaxDepth);
      DOMelementMaxDepthNodes.forEach(function (path) {
        phantomas.addOffender("DOMelementMaxDepth", path);
      });
    })();

    // count <iframe> tags
    document.querySelectorAll("iframe").forEach(function (iframe) {
      phantomas.incrMetric("iframesCount"); // @desc number of iframe nodes
      phantomas.addOffender("iframesCount", {
        element: phantomas.getDOMPath(iframe),
        url: iframe.src,
      });
    });

    phantomas.spyEnabled(true);
  });

  phantomas.spyEnabled(true);
})(window.__phantomas);
