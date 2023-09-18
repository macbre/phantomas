(function analyzeImageScope(phantomas) {
  window.addEventListener("load", function () {
    phantomas.spyEnabled(false, "Checking images");
    const images = document.querySelectorAll("img");
    phantomas.spyEnabled(true);

    images.forEach((node) => {
      var imgWidth = node.hasAttribute("width")
          ? parseInt(node.getAttribute("width"), 10)
          : false,
        imgHeight = node.hasAttribute("height")
          ? parseInt(node.getAttribute("height"), 10)
          : false;

      // get dimensions from inline CSS (issue #399)
      if (imgWidth === false || imgHeight === false) {
        imgWidth = parseInt(node.style.width, 10) || false;
        imgHeight = parseInt(node.style.height, 10) || false;
      }

      if (imgWidth === false || imgHeight === false) {
        phantomas.incrMetric("imagesWithoutDimensions");
        phantomas.addOffender("imagesWithoutDimensions", {
          path: phantomas.getDOMPath(node, true /* dontGoUpTheDom */),
          src: node.currentSrc,
        });
      }

      const html =
        node.parentNode.tagName === "PICTURE"
          ? node.parentNode.outerHTML
          : node.outerHTML;

      // Check if the image or one of its parents is in display:none
      // If it is the case, node.width and node.height values are not reliable.
      // https://stackoverflow.com/a/53068496/4716391
      const isVisible = !!node.offsetParent;
      phantomas.log(
        "analyzeImg: ignoring displayWidth and displayHeight because image is not visible"
      );

      if (node.currentSrc) {
        phantomas.emit("imgtag", {
          html: html,
          displayWidth: isVisible ? node.width : undefined,
          displayHeight: isVisible ? node.height : undefined,
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
          currentSrc: node.currentSrc,
          dpr: window.devicePixelRatio,
        });
      } else {
        phantomas.log(
          "analyzeImg: image tag found without currentSrc: %s",
          html
        );
      }
    });
  });
})(window.__phantomas);
