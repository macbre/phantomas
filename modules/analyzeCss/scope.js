(function (phantomas) {
  document.addEventListener("DOMContentLoaded", function () {
    // both DOM and CSSOM are constructed, no stylesheets are blocking JavaScript execution
    phantomas.spyEnabled(false, "Checking inline scripts");
    var inlineCss = document.querySelectorAll("style");
    phantomas.spyEnabled(true);

    inlineCss.forEach((node) => {
      // ignore inline <style> tags with type different than text/css (issue #694)
      const type = node.getAttribute("type") || "text/css";

      if (type === "text/css") {
        phantomas.emit("inlinecss", node.textContent);

        phantomas.incrMetric("cssInlineStyles");
        phantomas.addOffender("cssInlineStyles", {
          node: phantomas.getDOMPath(node),
        });
      } else {
        phantomas.log(
          'analyzeCss: inline <style> tag found with type="%s", ignoring...',
          type
        );
      }
    });
  });
})(window.__phantomas);
