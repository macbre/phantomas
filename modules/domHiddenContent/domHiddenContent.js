/**
 * Analyzes DOM hidden content
 */
"use strict";

module.exports = function (phantomas) {
  // total length of HTML of hidden elements (i.e. display: none)
  phantomas.setMetric("hiddenContentSize"); // @desc the size of content of hidden elements on the page (with CSS display: none) @offenders
  phantomas.setMetric("hiddenImages"); // @desc number of hidden images that can be lazy-loaded @offenders
};
