/**
 * Test cacheHits module
 */
const mock = require("./mock"),
  { describe } = require("@jest/globals");

describe("cacheHits", () => {
  describe("no caching headers", () => {
    mock.getContext(
      "cacheHits",
      function (phantomas) {
        return phantomas
          .recv({
            headers: {},
          })
          .report();
      },
      {
        cacheHits: 0,
        cacheMisses: 0,
        cachePasses: 0,
      }
    );
  });

  describe("Age header (hit)", () => {
    mock.getContext(
      "cacheHits",
      function (phantomas) {
        return phantomas
          .recv({
            headers: {
              Age: "14365",
            },
          })
          .report();
      },
      {
        cacheHits: 1,
        cacheMisses: 0,
        cachePasses: 0,
      }
    );
  });

  describe("Age + X-Cache header (hit)", () => {
    mock.getContext(
      "cacheHits",
      function (phantomas) {
        return phantomas
          .recv({
            headers: {
              Age: "14365",
              "X-Cache": "HIT",
            },
          })
          .report();
      },
      {
        cacheHits: 1,
        cacheMisses: 0,
        cachePasses: 0,
      }
    );
  });

  describe("Age header (0 seconds)", () => {
    mock.getContext(
      "cacheHits",
      function (phantomas) {
        return phantomas
          .recv({
            headers: {
              Age: "0",
            },
          })
          .report();
      },
      {
        cacheHits: 0,
        cacheMisses: 1,
        cachePasses: 0,
      }
    );
  });

  describe("Age header (N seconds)", () => {
    mock.getContext(
      "cacheHits",
      function (phantomas) {
        return phantomas
          .recv({
            headers: {
              Age: "24115",
            },
          })
          .report();
      },
      {
        cacheHits: 1,
        cacheMisses: 0,
        cachePasses: 0,
      }
    );
  });

  describe("hits", () => {
    mock.getContext(
      "cacheHits",
      function (phantomas) {
        return phantomas
          .recv({
            headers: {
              "X-Cache": "HIT",
            },
          })
          .report();
      },
      {
        cacheHits: 1,
        cacheMisses: 0,
        cachePasses: 0,
      }
    );
  });

  describe("hits (following the miss)", () => {
    mock.getContext(
      "cacheHits",
      function (phantomas) {
        return phantomas
          .recv({
            headers: {
              "X-Cache": "HIT, MISS",
            },
          })
          .report();
      },
      {
        cacheHits: 1,
        cacheMisses: 0,
        cachePasses: 0,
      }
    );
  });

  describe("misses", () => {
    mock.getContext(
      "cacheHits",
      function (phantomas) {
        return phantomas
          .recv({
            headers: {
              "X-Cache": "MISS",
            },
          })
          .report();
      },
      {
        cacheHits: 0,
        cacheMisses: 1,
        cachePasses: 0,
      }
    );
  });

  describe("passes", () => {
    mock.getContext(
      "cacheHits",
      function (phantomas) {
        return phantomas
          .recv({
            headers: {
              "X-Cache": "PASS",
            },
          })
          .report();
      },
      {
        cacheHits: 0,
        cacheMisses: 0,
        cachePasses: 1,
      }
    );
  });
});
