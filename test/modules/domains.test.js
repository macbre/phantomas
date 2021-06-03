/**
 * Test domains module
 */
const mock = require("./mock"),
  { describe } = require("@jest/globals");

describe("domains", () => {
  describe("calculates domains properly", () => {
    mock.getContext(
      "domains",
      function (phantomas) {
        var domains = [];

        domains.push({
          name: "example.com",
          cnt: 2,
        });
        domains.push({
          name: "awesome.cdn.com",
          cnt: 6,
        });
        domains.push({
          name: "ads.co.uk",
          cnt: 3,
        });

        domains.forEach(function (domain) {
          for (var i = 0; i < domain.cnt; i++) {
            phantomas.recv({
              domain: domain.name,
            });
          }
        });

        // calculate metrics
        return phantomas.report();
      },
      {
        domains: 3,
        maxRequestsPerDomain: 6,
        medianRequestsPerDomain: 3,
      }
    );
  });

  describe("handles responses without 'domain' property", () => {
    mock.getContext(
      "domains",
      function (phantomas) {
        phantomas.recv({
          domain: undefined,
        });

        // calculate metrics
        return phantomas.report();
      },
      {
        domains: 0,
        maxRequestsPerDomain: 0,
        medianRequestsPerDomain: 0,
      }
    );
  });
});
