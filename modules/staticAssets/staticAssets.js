/**
 * Analyzes static assets (CSS, JS and images)
 */
"use strict";

module.exports = function (phantomas) {
  var SIZE_THRESHOLD = 2 * 1024;

  // count requests for each asset
  var Collection = require("../../lib/collection"),
    assetsReqCounter = new Collection(),
    cookieDomains = new Collection(),
    // TODO: use 3pc database with tracking services
    trackingUrls =
      /google-analytics.com\/__utm.gif|pixel.quantserve.com\/pixel/;

  phantomas.setMetric("assetsNotGzipped"); // @desc number of static assets that were not gzipped
  phantomas.setMetric("assetsWithQueryString"); // @desc number of static assets requested with query string (e.g. ?foo) in URL
  phantomas.setMetric("assetsWithCookies"); // @desc number of static assets requested from domains with cookie set
  phantomas.setMetric("smallImages"); // @desc number of images smaller than 2 KiB that can be base64 encoded
  phantomas.setMetric("smallCssFiles"); // @desc number of CSS assets smaller than 2 KiB that can be inlined or merged
  phantomas.setMetric("smallJsFiles"); // @desc number of JS assets smaller than 2 KiB that can be inlined or merged
  phantomas.setMetric("multipleRequests"); // @desc number of static assets that are requested more than once

  phantomas.on("recv", (entry) => {
    var isContent = entry.status === 200;

    // mark domains with cookie set
    if (entry.hasCookies) {
      cookieDomains.push(entry.domain);
    }

    // skip tracking requests
    if (trackingUrls.test(entry.url)) {
      return;
    }

    // check for query string -> foo.css?123
    if (entry.isImage || entry.isJS || entry.isCSS) {
      if (entry.url.indexOf("?") > -1) {
        phantomas.incrMetric("assetsWithQueryString");
        phantomas.addOffender("assetsWithQueryString", {
          url: entry.url,
          contentType: entry.contentType,
        });
      }
    }

    // check for not-gzipped assets (issue #515)
    if (
      entry.isJS ||
      entry.isCSS ||
      entry.isHTML ||
      entry.isJSON ||
      entry.isSVG ||
      entry.isTTF ||
      entry.isXML ||
      entry.isFavicon
    ) {
      if (!entry.gzip && isContent) {
        phantomas.incrMetric("assetsNotGzipped");
        phantomas.addOffender("assetsNotGzipped", {
          url: entry.url,
          contentType: entry.contentType,
        });
      }
    }

    // small assets can be inlined
    // responseSize - that's the response size as reported by Chrome's dev tools (headers + compressed body)
    if (entry.responseSize < SIZE_THRESHOLD) {
      // check small images that can be base64 encoded
      if (entry.isImage) {
        phantomas.incrMetric("smallImages");
        phantomas.addOffender("smallImages", {
          url: entry.url,
          size: entry.responseSize,
        });
      }
      // CSS / JS that can be inlined
      else if (entry.isCSS) {
        phantomas.incrMetric("smallCssFiles");
        phantomas.addOffender("smallCssFiles", {
          url: entry.url,
          size: entry.responseSize,
        });
      } else if (entry.isJS) {
        phantomas.incrMetric("smallJsFiles");
        phantomas.addOffender("smallJsFiles", {
          url: entry.url,
          size: entry.responseSize,
        });
      }
    }

    if (entry.isImage || entry.isJS || entry.isCSS) {
      // count number of requests to each asset
      assetsReqCounter.push(entry.url);

      // count static assets requested from domains with cookie set
      if (cookieDomains.has(entry.domain)) {
        phantomas.incrMetric("assetsWithCookies");
        phantomas.addOffender("assetsWithCookies", {
          url: entry.url,
          contentType: entry.contentType,
        });
      }
    }
  });

  phantomas.on("report", () => {
    assetsReqCounter.forEach((asset, cnt) => {
      if (cnt > 1) {
        phantomas.incrMetric("multipleRequests");
        phantomas.addOffender("multipleRequests", { url: asset, count: cnt });
      }
    });
  });
};
