/**
 * Meters number of invocations of window.alert, window.confirm, and
 * window.prompt.
 */
"use strict";

module.exports = (phantomas) => {
  phantomas.setMetric("windowAlerts"); // @desc number of calls to window.alert
  phantomas.setMetric("windowConfirms"); // @desc number of calls to window.confirm
  phantomas.setMetric("windowPrompts"); // @desc number of calls to window.prompt

  phantomas.on("alert", (msg) => {
    phantomas.incrMetric("windowAlerts");
    phantomas.addOffender("windowAlerts", msg);
  });

  phantomas.on("confirm", (msg) => {
    phantomas.incrMetric("windowConfirms");
    phantomas.addOffender("windowConfirms", msg);
  });

  phantomas.on("prompt", (msg) => {
    phantomas.incrMetric("windowPrompts");
    phantomas.addOffender("windowPrompts", msg);
  });
};
