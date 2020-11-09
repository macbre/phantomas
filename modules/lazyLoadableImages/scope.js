((phantomas) => {
  phantomas.spyEnabled(
    false,
    "setting up which images can be lazy-loaded analysis"
  );

  window.addEventListener("load", () => {
    phantomas.spyEnabled(false, "analyzing which images can be lazy-loaded");

    var images = document.body.getElementsByTagName("img"),
      i,
      len = images.length,
      offset,
      path,
      processedImages = {},
      src,
      viewportHeight = window.innerHeight;

    phantomas.log(
      "lazyLoadableImages: %d image(s) found, assuming %dpx offset to be the fold",
      len,
      viewportHeight
    );

    for (i = 0; i < len; i++) {
      // @see https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
      offset = images[i].getBoundingClientRect().top;

      // use currentSrc instead of src to handle pictures or srcset syntaxes
      // @see https://stackoverflow.com/questions/35586728/detect-used-srcset-or-picture-tag-source-with-javascript
      src = images[i].currentSrc;

      // ignore base64-encoded images
      if (src === null || src === "" || /^data:/.test(src)) {
        continue;
      }

      path = phantomas.getDOMPath(images[i]);

      // get the most top position for a given image (deduplicate by src)
      if (typeof processedImages[src] === "undefined") {
        processedImages[src] = {
          offset: offset,
          path: path,
        };
      }

      // maybe there's the same image loaded above the fold?
      if (offset < processedImages[src].offset) {
        processedImages[src] = {
          offset: offset,
          path: path,
        };
      }
    }

    phantomas.log(
      "lazyLoadableImages: checking %d unique image(s)",
      Object.keys(processedImages).length
    );

    Object.keys(processedImages).forEach((src) => {
      var img = processedImages[src];

      if (img.offset > viewportHeight) {
        phantomas.log(
          "lazyLoadableImages: <%s> image (%s) is below the fold (at %dpx)",
          src,
          img.path,
          img.offset
        );

        phantomas.incrMetric("lazyLoadableImagesBelowTheFold");
        phantomas.addOffender("lazyLoadableImagesBelowTheFold", {
          url: src,
          node: img.path,
          offset: img.offset,
        });
      }
    });

    phantomas.spyEnabled(true);
  });

  phantomas.spyEnabled(true);
})(window.__phantomas);
