/**
 * Test redirects module
 */
const mock = require("./mock"),
  { describe } = require("@jest/globals");

describe("redirects", () => {
  describe("HTTP 301/302", () => {
    mock.getContext(
      "redirects",
      function (phantomas) {
        return phantomas
          .recv({
            isRedirect: true,
            timeToLastByte: 20,
            headers: {},
          })
          .report();
      },
      {
        redirects: 1,
        redirectsTime: 20,
      }
    );
  });
  describe("HTTP 200", () => {
    mock.getContext(
      "redirects",
      function (phantomas) {
        return phantomas.recv().report();
      },
      {
        redirects: 0,
        redirectsTime: 0,
      }
    );
  });
});
