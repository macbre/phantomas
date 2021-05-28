/**
 * Test cacheHits module
 */
const mock = require("./mock"),
  { describe } = require("@jest/globals");

describe("keepAlive", () => {
  describe("connection closed, no more requests", () => {
    mock.getContext(
      "keepAlive",
      function (phantomas) {
        return phantomas
          .recv({
            protocol: "http",
            domain: "foo.net",
            url: "http://foo.net/",
            headers: {
              Connection: "close",
            },
          })
          .send({
            protocol: "http",
            domain: "foo.bar",
          })
          .report();
      },
      {
        closedConnections: 0,
      }
    );
  });

  describe("connection not closed, more requests", () => {
    mock.getContext(
      "keepAlive",
      function (phantomas) {
        return phantomas
          .recv({
            protocol: "http",
            domain: "foo.net",
            url: "http://foo.net/",
            headers: {},
          })
          .send({
            protocol: "http",
            domain: "foo.net",
          })
          .report();
      },
      {
        closedConnections: 0,
      }
    );
  });
});
