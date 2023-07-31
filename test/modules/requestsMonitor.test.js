/**
 * Test requestsMonitor core module
 */
const assert = require("assert"),
  mock = require("./mock"),
  { describe, expect, test } = require("@jest/globals");

function sendReq(url, extra) {
  var phantomas = mock.initCoreModule("requestsMonitor"),
    ret = false;

  phantomas.on("recv", (entry) => {
    ret = entry;
  });
  phantomas.sendRequest(
    Object.assign(
      {
        url: url,
      },
      extra || {}
    )
  );
  return ret;
}

function recvBase64(url) {
  var phantomas = mock.initCoreModule("requestsMonitor"),
    ret = false;

  phantomas.on("base64recv", function (entry) {
    ret = entry;
  });
  phantomas.recvRequest({ url });

  return ret;
}

describe("requestMonitor", () => {
  test("triggers 'send' event", () => {
    const phantomas = mock.initCoreModule("requestsMonitor");
    phantomas.sendRequest();

    assert.ok(phantomas.emitted("send"));
  });

  test("detects POST requests", () => {
    const phantomas = mock.initCoreModule("requestsMonitor");
    phantomas.sendRequest({
      method: "POST",
    });

    mock.assertMetric("postRequests", 1);
  });

  test("detects not found responses", () => {
    const phantomas = mock.initCoreModule("requestsMonitor");
    phantomas.sendRequest({
      status: 404,
    });

    mock.assertMetric("notFound", 1);
  });
});

describe("URLs are properly parsed when sent", () => {
  test("http://example.com/foo?bar=test&a=b", () => {
    const entry = sendReq("http://example.com/foo?bar=test&a=b");

    // https://jestjs.io/docs/expect#tomatchobjectobject
    expect(entry).toMatchObject({
      protocol: "http",
      domain: "example.com",
      query: "bar=test&a=b",
    });

    expect(entry["isSSL"]).toBeUndefined();
    expect(entry["isBase64"]).toBeUndefined();
  });

  test("HTTPS is property detected", () => {
    const entry = sendReq("https://example.com/foo?bar=test&a=b");

    // https://jestjs.io/docs/expect#tomatchobjectobject
    expect(entry).toMatchObject({
      protocol: "https",
      isSSL: true,
      domain: "example.com",
      query: "bar=test&a=b",
    });
  });

  test.skip("base64-encoded data is property detected", () => {
    const entry = recvBase64("data:image/png;base64,iVBORw0KGgoAAAA");

    // https://jestjs.io/docs/expect#tomatchobjectobject
    expect(entry).toMatchObject({
      isBase64: true,
      protocol: false,
      domain: false,
    });

    expect(entry["isSSL"]).toBeUndefined();
  });
});

describe("Redirects", () => {
  test.each([
    [301, true],
    [302, true],
    [303, true],
    [200, undefined],
    [404, undefined],
  ])("handles %i response code", (statusCode, expected) => {
    const entry = sendReq("", {
      status: statusCode,
    });

    if (expected) {
      expect(entry.isRedirect).toBeTruthy();
    } else {
      expect(entry.isRedirect).toBeUndefined();
    }
  });
});

describe("Content types", () => {
  const sendContentType = (contentType, url) => {
    return sendReq(url, {
      headers: { "Content-Type": contentType },
    });
  };

  test.each([
    ["text/html", "isHTML"],
    ["text/xml", "isXML"],
    ["text/css", "isCSS"],
    ["text/javascript", "isJS"],
    ["application/json", "isJSON"],
    // images
    ["image/png", "isImage"],
    ["image/jpeg", "isImage"],
    ["image/gif", "isImage"],
    ["image/webp", "isImage"],
    ["image/avif", "isImage"],
    ["image/svg+xml", "isImage"],
    ["image/svg+xml", "isSVG"],
    ["image/x-icon", "isFavicon"],
    ["image/vnd.microsoft.icon", "isFavicon"],
    // video
    ["video/webm", "isVideo"],
    // web-fonts
    ["application/font-woff", "isWebFont"],
    ["application/font-woff2", "isWebFont"],
    ["application/font-woff2", "isWebFont"],
    ["application/x-font-ttf", "isWebFont"],
    ["application/x-font-ttf", "isTTF"],
  ])('"%s" sets "%s" flag', (contentType, expected) => {
    const entry = sendContentType(contentType);
    expect(entry[expected]).toBeTruthy();
  });

  test('"application/octet-stream" sets "isTTF" flag (via URL)', () => {
    const entry = sendContentType(
      "application/octet-stream",
      "http://foo.bar/font.otf"
    );
    expect(entry.isWebFont).toBeTruthy();
    expect(entry.isTTF).toBeUndefined();
  });
});

describe("Compressions", () => {
  test.each([
    ["gzip", "gzip"],
    ["br", "gzip"],
    ["br", "brotli"],
  ])("handles %s content encoding", (contentEncoding, expected) => {
    const entry = sendReq(undefined, {
      headers: { "Content-Encoding": contentEncoding },
    });

    expect(entry[expected]).toBeTruthy();
  });
});
