/**
 * Domains monitor
 */
"use strict";

const Stats = require("fast-stats").Stats;

module.exports = function (phantomas) {
  var Collection = require("../../lib/collection"),
    domains = new Collection();

  phantomas.setMetric("domains"); // @desc number of domains used to fetch the page @offenders
  phantomas.setMetric("maxRequestsPerDomain"); // @desc maximum number of requests fetched from a single domain
  phantomas.setMetric("medianRequestsPerDomain"); // @desc median of number of requests fetched from each domain

  phantomas.on("recv", (entry) => {
    var domain = entry.domain;

    if (domain) {
      domains.push(domain);
    }
  });

  // add metrics
  phantomas.on("report", () => {
    var domainsRequests = new Stats();

    domains.sort().forEach(function (domain, requests) {
      phantomas.addOffender("domains", { domain, requests });

      domainsRequests.push(requests);
    });

    if (domains.getLength() > 0) {
      phantomas.setMetric("domains", domains.getLength());
      phantomas.setMetric("maxRequestsPerDomain", domainsRequests.range()[1]);
      phantomas.setMetric("medianRequestsPerDomain", domainsRequests.median());
    }
  });
};
