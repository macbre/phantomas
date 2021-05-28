/**
 * Tests CommonJS module
 */
"use strict";

var assert = require("assert"),
  phantomas = require("..");

const { describe, it } = require("@jest/globals");

const URL = "http://127.0.0.1:8888/";

describe("CommonJS module's promise", () => {
  describe("should resolve a promise", () => {
    it("when provided a valid url", async () => {
      const res = await phantomas(URL);

      assert.strictEqual(res.getUrl(), URL);
      assert.strictEqual(typeof res.getMetrics, "function");
      assert.strictEqual(typeof res.setMetric, "function");
    });
  });

  describe("should reject a promise", () => {
    it("when not provided with URL", async () => {
      try {
        await phantomas(false);
      } catch (err) {
        assert.strictEqual(err.message, "URL must be a string");
      }
    });

    it("when timed out", async () => {
      try {
        await phantomas("http://phantomjs.org/", {
          timeout: 0.001, // [sec]
        });
      } catch (err) {
        assert.strictEqual(err.message, "Navigation timeout of 1 ms exceeded");
      }
    });
  });
});
