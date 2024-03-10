/**
 * Delays report generation for a given time
 */
"use strict";

const { setTimeout } = require("timers/promises");

module.exports = function (phantomas) {
  // e.g. --post-load-delay 5
  var delay = parseInt(phantomas.getParam("post-load-delay"), 10);

  if (!delay) {
    return;
  }

  // https://github.com/GoogleChrome/puppeteer/blob/v1.11.0/docs/api.md#framewaitforselectororfunctionortimeout-options-args
  phantomas.log("Will wait %d second(s) after load", delay);

  phantomas.on("beforeClose", async (page) => {
    phantomas.log("Sleeping for %d seconds", delay);

    return setTimeout(delay * 1000);
  });
};
