/**
 * Retrieves stats about layouts, style recalcs and JS execution
 *
 * Metrics from https://github.com/puppeteer/puppeteer/blob/main/docs/api.md#pagemetrics
 */
"use strict";

module.exports = function (phantomas) {

  // Converts seconds into milliseconds
  function milliseconds(value) {
    return Math.round(value * 1000);
  }

  phantomas.on("metrics", (metrics) => {
    phantomas.setMetric("layoutCount", metrics.LayoutCount); // @desc total number of full or partial page layout
    phantomas.setMetric("layoutDuration", milliseconds(metrics.LayoutDuration)); // @desc combined durations of all page layouts
    phantomas.setMetric("recalcStyleCount", metrics.RecalcStyleCount); // @desc total number of page style recalculations
    phantomas.setMetric("recalcStyleDuration", milliseconds(metrics.RecalcStyleDuration)); // @desc combined duration of all page style recalculations
    phantomas.setMetric("scriptDuration", milliseconds(metrics.ScriptDuration)); // @desc combined duration of JavaScript execution
    phantomas.setMetric("taskDuration", milliseconds(metrics.TaskDuration)); // @desc combined duration of all tasks performed by the browser
  });
};
