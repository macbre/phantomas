(function globalVariablesScope(phantomas) {
  // get the list of initial, built-in global variables
  var allowed = [],
    varName;

  for (varName in window) {
    allowed.push(varName);
  }

  phantomas.spyEnabled(false, "initializing global variables metrics");

  window.addEventListener("load", () => {
    var varName;

    // get all members of window and filter them
    for (varName in window) {
      try {
        if (
          allowed.indexOf(varName) > -1 ||
          typeof window[varName] ===
            "undefined" /* ignore variables exposed by window.__defineGetter__ */
        ) {
          continue;
        }

        // filter out 0, 1, 2, ...
        if (/^\d+$/.test(varName)) {
          continue;
        }

        phantomas.incrMetric("globalVariables");
        phantomas.addOffender("globalVariables", varName);

        if ([false, null].indexOf(window[varName]) > -1) {
          phantomas.incrMetric("globalVariablesFalsy");
          phantomas.addOffender("globalVariablesFalsy", {
            name: varName,
            value: window[varName],
          });
        }
      } catch (ex) {
        // handle errors (issue #560)
        phantomas.log(
          "globalVariables: error when checking %s - %s!",
          varName,
          ex.message
        );
      }
    }
  });

  phantomas.spyEnabled(true);
})(window.__phantomas);
