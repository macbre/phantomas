/**
 * Meters the number of page errors, and provides traces as offenders for "jsErrors" metric
 */
"use strict";

module.exports = function (phantomas) {
  phantomas.setMetric("jsErrors"); // @desc number of JavaScript errors

  phantomas.on("jserror", function (msg, trace) {
    phantomas.log(msg);
    phantomas.log("Backtrace: " + trace.join(" / "));

    phantomas.incrMetric("jsErrors");
    phantomas.addOffender("jsErrors", msg + " - " + trace.join(" / "));
  });
};
