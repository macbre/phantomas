(function localStorageScope(phantomas) {
  window.addEventListener("load", () => {
    try {
      var entries = Object.keys(window.localStorage);

      phantomas.setMetric("localStorageEntries", entries.length);

      entries.forEach(function (entry) {
        phantomas.addOffender("localStorageEntries", entry);
      });
    } catch (ex) {
      phantomas.log("localStorageEntries: not set because " + ex + "!");
    }
  });
})(window.__phantomas);
