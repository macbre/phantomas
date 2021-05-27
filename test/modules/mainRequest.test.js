/**
 * Tests mainRequest module
 */
const mock = require("./mock"),
  { describe } = require("@jest/globals");

describe("mainRequest", () => {
  describe("redirect request", () => {
    mock.getContext(
      "mainRequest",
      function (phantomas) {
        return phantomas
          .recv(
            {},
            {
              status: 301,
            }
          )
          .responseEnd(
            {},
            {
              status: 200,
            }
          )
          .report();
      },
      {
        statusCodesTrail: "301,200",
      }
    );
  });
  describe("long redirect request", () => {
    mock.getContext(
      "mainRequest",
      function (phantomas) {
        return phantomas
          .recv(
            {},
            {
              status: 301,
            }
          )
          .recv(
            {},
            {
              status: 302,
            }
          )
          .responseEnd(
            {},
            {
              status: 404,
            }
          )
          .report();
      },
      {
        statusCodesTrail: "301,302,404",
      }
    );
  });
  describe("non-redirect (e.g. terminal) first request", () => {
    mock.getContext(
      "mainRequest",
      function (phantomas) {
        return phantomas
          .responseEnd(
            {},
            {
              status: 200,
            }
          )
          .report();
      },
      {
        statusCodesTrail: "200",
      }
    );
  });
  describe("multiple requests", () => {
    mock.getContext(
      "mainRequest",
      function (phantomas) {
        return phantomas
          .responseEnd(
            {},
            {
              status: 200,
            }
          )
          .recv(
            {},
            {
              status: 404,
            }
          )
          .report();
      },
      {
        statusCodesTrail: "200",
      }
    );
  });
});
