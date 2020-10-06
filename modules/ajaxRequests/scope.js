(function (phantomas) {
  phantomas.spy(
    window.XMLHttpRequest.prototype,
    "open",
    (_, method, url, async) => {
      phantomas.incrMetric("ajaxRequests");
      phantomas.addOffender("ajaxRequests", { url, method });

      phantomas.log("Ajax request: " + url);

      if (async === false) {
        phantomas.incrMetric("synchronousXHR");
        phantomas.addOffender("synchronousXHR", { url, method });
        phantomas.log("synchronous XMLHttpRequest call to <%s>", url);
      }
    },
    true
  );
})(window.__phantomas);
