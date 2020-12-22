/**
 * Retrieves stats about layouts, style recalcs and JS execution
 *
 * Metrics from https://github.com/puppeteer/puppeteer/blob/main/docs/api.md#pagemetrics
 */
"use strict";

module.exports = function (phantomas) {

  phantomas.on("metrics", (metrics) => {
    phantomas.setMetric("layoutCount", metrics.LayoutCount); // @desc total number of full or partial page layout
    phantomas.setMetric("layoutDuration", metrics.LayoutDuration); // @desc combined durations in seconds of all page layouts
    phantomas.setMetric("recalcStyleCount", metrics.RecalcStyleCount); // @desc total number of page style recalculations
    phantomas.setMetric("recalcStyleDuration", metrics.RecalcStyleDuration); // @desc combined duration in seconds of all page style recalculations
    phantomas.setMetric("scriptDuration", metrics.ScriptDuration); // @desc combined duration in seconds of JavaScript execution
    phantomas.setMetric("taskDuration", metrics.TaskDuration); // @desc combined duration in seconds of all tasks performed by the browser
  });
};
