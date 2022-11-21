(function domHiddenContentScope(phantomas) {
  phantomas.spyEnabled(false, "initializing hidden content analysis");

  window.addEventListener("load", () => {
    var runner = new phantomas.nodeRunner(),
      lazyLoadableImages = {};

    phantomas.spyEnabled(false, "analyzing hidden content");

    runner.walk(document.body, (node) => {
      switch (node.nodeType) {
        case Node.ELEMENT_NODE:
          // @see https://developer.mozilla.org/en/DOM%3awindow.getComputedStyle
          var styles = window.getComputedStyle(node);

          if (styles && styles.getPropertyValue("display") === "none") {
            if (typeof node.innerHTML === "string") {
              var size = node.innerHTML.length;
              phantomas.incrMetric("hiddenContentSize", size);

              // log hidden containers bigger than 1 kB
              if (size > 1024) {
                phantomas.addOffender(
                  "hiddenContentSize",
                  phantomas.getDOMPath(node) + " (" + size + " characters)"
                );
              }
            }

            // count hidden images that can be lazy loaded (issue #524)
            var images = [];
            if (node.tagName === "IMG") {
              images = [node];
            } else if (typeof node.querySelectorAll === "function") {
              images = node.querySelectorAll("img") || [];
            }

            for (var i = 0, len = images.length; i < len; i++) {
              var src = images[i].src,
                path;

              if (src === "" || src.indexOf("data:image") === 0) continue;

              if (!lazyLoadableImages[src]) {
                path = phantomas.getDOMPath(images[i]);

                lazyLoadableImages[src] = {
                  path: path,
                };
              }
            }

            // don't run for child nodes as they're hidden as well
            return false;
          }
          break;
      }
    });

    Object.keys(lazyLoadableImages).forEach((img) => {
      var entry = lazyLoadableImages[img];

      phantomas.incrMetric("hiddenImages");
      phantomas.addOffender("hiddenImages", img);

      phantomas.log(
        "hiddenImages: <%s> image (%s) is hidden and can be lazy-loaded",
        img,
        entry.path
      );
    });

    phantomas.spyEnabled(true);
  });

  phantomas.spyEnabled(true);
})(window.__phantomas);
