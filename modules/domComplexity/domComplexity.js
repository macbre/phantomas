/**
 * Analyzes DOM complexity
 */
"use strict";

module.exports = function (phantomas) {
  phantomas.setMetric("bodyHTMLSize"); // @desc the size of body tag content (document.body.innerHTML.length)

  // total length of HTML comments (including <!-- --> brackets)
  phantomas.setMetric("commentsSize"); // @desc the size of HTML comments on the page @offenders

  // total length of text nodes with whitespaces only (i.e. pretty formatting of HTML)
  phantomas.setMetric("whiteSpacesSize"); // @desc the size of text nodes with whitespaces only

  // count all tags
  phantomas.setMetric("DOMelementsCount"); // @desc total number of HTML element nodes
  phantomas.setMetric("DOMelementMaxDepth"); // @desc maximum level on nesting of HTML element node @offenders

  // nodes with inlines CSS (style attribute)
  phantomas.setMetric("nodesWithInlineCSS"); // @desc number of nodes with inline CSS styling (with style attribute) @offenders

  phantomas.setMetric("iframesCount"); // @desc number of iframe nodes @offenders

  // duplicated ID (issue #392)
  phantomas.setMetric("DOMidDuplicated"); // @desc number of duplicated IDs found in DOM

  phantomas.on("DOMids", (ids) => {
    var Collection = require("../../lib/collection"),
      DOMids = new Collection();

    ids.forEach((id) => DOMids.push(id));
    phantomas.log("Nodes with IDs: " + ids.length);

    DOMids.sort().forEach((id, cnt) => {
      if (cnt > 1) {
        phantomas.incrMetric("DOMidDuplicated");
        phantomas.addOffender("DOMidDuplicated", { id: id, count: cnt });
      }
    });
  });
};
