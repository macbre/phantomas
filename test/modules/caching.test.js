/**
 * Test caching module
 */
const mock = require("./mock"),
  { describe } = require("@jest/globals"),
  URL = "http://127.0.0.1:8888/static/mdn.png";

describe("caching", () => {
  describe("caching not specified", () => {
    mock.getContext(
      "caching",
      function (phantomas) {
        return phantomas
          .recv({
            url: URL,
            isImage: true,
            headers: {
              "X-Foo": "Bar",
            },
          })
          .report();
      },
      {
        cachingNotSpecified: 1,
      },
      {
        cachingNotSpecified: [URL],
      }
    );
  });
  describe("old caching header used (Expires)", () => {
    mock.getContext(
      "caching",
      function (phantomas) {
        return phantomas
          .recv({
            url: URL,
            isImage: true,
            headers: {
              Expires: "Wed, 21 Oct 2015 07:28:00 GMT",
            },
          })
          .report();
      },
      {
        oldCachingHeaders: 1,
        cachingNotSpecified: 0,
        cachingDisabled: 1,
      },
      {
        cachingDisabled: [URL],
      }
    );
  });
  describe("old caching header used (Pragma)", () => {
    mock.getContext(
      "caching",
      function (phantomas) {
        return phantomas
          .recv({
            url: URL,
            isImage: true,
            headers: {
              Pragma: "no-cache",
            },
          })
          .report();
      },
      {
        oldCachingHeaders: 1,
        cachingNotSpecified: 1,
      },
      {
        oldCachingHeaders: [
          {
            headerName: "Pragma",
            url: "http://127.0.0.1:8888/static/mdn.png",
            value: "no-cache",
          },
        ],
        cachingNotSpecified: [URL],
      }
    );
  });
  describe("caching too short", () => {
    mock.getContext(
      "caching",
      function (phantomas) {
        return phantomas
          .recv({
            url: URL,
            isImage: true,
            headers: {
              "Cache-Control": "max-age=600",
            },
          })
          .report();
      },
      {
        cachingTooShort: 1,
        cachingUseImmutable: 0,
      },
      {
        cachingTooShort: [{ url: URL, ttl: 600 }],
      }
    );
  });
  describe("caching not too short (but without immutable)", () => {
    mock.getContext(
      "caching",
      function (phantomas) {
        return phantomas
          .recv({
            url: URL,
            isImage: true,
            headers: {
              "Cache-Control": "max-age=2592000", // 30 days
            },
          })
          .report();
      },
      {
        cachingTooShort: 0,
        cachingUseImmutable: 1,
      },
      {
        cachingUseImmutable: [{ url: URL, ttl: 2592000 }],
      }
    );
  });
  describe("caching not too short (and use immutable)", () => {
    mock.getContext(
      "caching",
      function (phantomas) {
        return phantomas
          .recv({
            url: URL,
            isImage: true,
            headers: {
              "Cache-Control": "max-age=2592000, immutable", // 30 days
            },
          })
          .report();
      },
      {
        cachingTooShort: 0,
        cachingUseImmutable: 0,
      }
    );
  });
});
