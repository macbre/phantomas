(function (phantomas) {
  document.addEventListener("DOMContentLoaded", () => {
    // @see https://github.com/HTTPArchive/httparchive/blob/master/custom_metrics/document_height.js
    var doc = document,
      body = doc.body,
      docelem = doc.documentElement;

    var documentHeight = Math.max(
      body.scrollHeight,
      body.offsetHeight,
      docelem.clientHeight,
      docelem.scrollHeight,
      docelem.offsetHeight
    );

    phantomas.setMetric("documentHeight", documentHeight);
  });
})(window.__phantomas);
