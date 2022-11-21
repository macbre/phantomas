/**
 * Analyzes Age and X-Cache headers from caching servers like Squid or Varnish
 */
"use strict";

module.exports = function (phantomas) {
  phantomas.setMetric("cacheHits"); // @desc number of cache hits @offenders
  phantomas.setMetric("cacheMisses"); // @desc number of cache misses @offenders
  phantomas.setMetric("cachePasses"); // @desc number of cache passes @offenders

  phantomas.on("recv", (entry) => {
    let isHit, isMiss, isPass;

    // parser response headers
    //
    // X-Cache:HIT, HIT
    // X-Cache:arsenic miss (0)
    // Age: 170221
    const age =
        typeof entry.headers.Age !== "undefined"
          ? parseInt(entry.headers.Age, 10)
          : undefined,
      xCacheHeader = (entry.headers["X-Cache"] || "").toLowerCase();

    if (xCacheHeader !== "") {
      isHit = xCacheHeader.indexOf("hit") > -1;

      if (!isHit) {
        isPass = xCacheHeader.indexOf("pass") > -1;
        isMiss = xCacheHeader.indexOf("miss") > -1;
      }
    }
    // @see http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.6
    else if (typeof age === "number") {
      isHit = age > 0;
      // Varnish sets age to 0 for fresh & not cached objects
      isMiss = age === 0;
    }

    // now set metrics
    if (isHit) {
      phantomas.incrMetric("cacheHits");
      phantomas.addOffender("cacheHits", entry.url);
    } else if (isPass) {
      phantomas.incrMetric("cachePasses");
      phantomas.addOffender("cachePasses", entry.url);
    } else if (isMiss) {
      phantomas.incrMetric("cacheMisses");
      phantomas.addOffender("cacheMisses", entry.url);
    }
  });
};
