/**
 * Test staticAssets module
 */
const mock = require("./mock"),
  { describe, it } = require("@jest/globals");

var URL = "http://example.com/";

describe("staticAssets", () => {
  describe("no-op", () => {
    mock.getContext(
      "staticAssets",
      function (phantomas) {
        return phantomas.recvRequest().report();
      },
      {
        assetsNotGzipped: 0,
        assetsWithQueryString: 0,
        assetsWithCookies: 0,
        smallImages: 0,
        smallCssFiles: 0,
        smallJsFiles: 0,
        multipleRequests: 0,
      }
    );
  });
  describe("with query string", () => {
    mock.getContext(
      "staticAssets",
      function (phantomas) {
        return phantomas
          .recv({
            url: URL + "?foo=bar",
            status: 200,
            isCSS: true,
            type: "css",
          })
          .report();
      },
      {
        assetsWithQueryString: 1,
      }
    );
  });
  describe("with cookies", () => {
    mock.getContext(
      "staticAssets",
      function (phantomas) {
        return phantomas
          .recv({
            url: URL,
            status: 200,
            isCSS: true,
            type: "css",
            hasCookies: true,
          })
          .report();
      },
      {
        assetsWithCookies: 1,
      }
    );
  });
  describe("multiple requests", () => {
    mock.getContext(
      "staticAssets",
      function (phantomas) {
        var entry = {
          url: URL,
          status: 200,
          isCSS: true,
          type: "css",
        };

        return phantomas.recv(entry).recv(entry).recv(entry).report();
      },
      {
        multipleRequests: 1, // one assets loaded multiple times
      }
    );
  });
  describe("normal images", () => {
    mock.getContext(
      "staticAssets",
      function (phantomas) {
        return phantomas
          .recv({
            url: URL,
            status: 200,
            isImage: true,
            type: "image",
            responseSize: 32 * 1024,
          })
          .report();
      },
      {
        smallImages: 0,
      }
    );
  });
  describe("small images", () => {
    mock.getContext(
      "staticAssets",
      function (phantomas) {
        return phantomas
          .recv({
            url: URL,
            status: 200,
            isImage: true,
            type: "image",
            responseSize: 1024,
          })
          .report();
      },
      {
        smallImages: 1,
      }
    );
  });
  describe("small CSS", () => {
    mock.getContext(
      "staticAssets",
      function (phantomas) {
        return phantomas
          .recv({
            url: URL,
            status: 200,
            isCSS: true,
            type: "css",
            responseSize: 1024,
          })
          .report();
      },
      {
        smallCssFiles: 1,
      }
    );
  });
  describe("small JS", () => {
    mock.getContext(
      "staticAssets",
      function (phantomas) {
        return phantomas
          .recv({
            url: URL,
            status: 200,
            isJS: true,
            type: "js",
            responseSize: 1024,
          })
          .report();
      },
      {
        smallJsFiles: 1,
      }
    );
  });
});

// cases for "assetsNotGzipped" metric (issue #515)
describe("assetsNotGzipped", () => {
  [
    "isJS",
    "isCSS",
    "isHTML",
    "isJSON",
    "isSVG",
    "isTTF",
    "isXML",
    "isFavicon",
  ].forEach(function (field) {
    describe(`${field.substr(2)} should be gzipped`, () => {
      mock.getContext(
        "staticAssets",
        function (phantomas) {
          var arg = {
            url: URL,
            status: 200,
            type: "foo",
          };
          arg[field] = true;

          return phantomas.recv(arg).report();
        },
        {
          assetsNotGzipped: 1,
        }
      );
    });
  });
});
