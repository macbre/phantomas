/**
 * Integration tests using server-start.sh script
 */
"use strict";

const { describe, it, test } = require("@jest/globals");

const assert = require("assert"),
  fs = require("fs"),
  yaml = require("js-yaml"),
  phantomas = require(".."),
  extras = require("./integration-test-extra");

const TEST_HOST = "127.0.0.1";
var WEBROOT = `http://${TEST_HOST}:8888`; // see start-server.sh

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on("unhandledRejection", (err) => {
  throw err;
});

describe("Test server healthcheck", () => {
  [
    WEBROOT,
    // `https://${TEST_HOST}:8889`, // this has a really old TLS
    `https://${TEST_HOST}:9000`,
    `https://${TEST_HOST}:9001`,
  ].forEach((url) => {
    test.concurrent(`should be up and running at <${url}>`, async () => {
      const isHttps = url.startsWith("https://");
      const client = require(isHttps ? "https" : "http");

      const opts = isHttps ? { rejectUnauthorized: false } : {};

      await new Promise((resolve, reject) => {
        client.get(url, opts, (res) => {
          const { statusCode } = res;
          assert.strictEqual(statusCode, 200, "responds with HTTP 200");

          resolve();
        });
      });
    });
  });
});

// register tests from spec file
var raw = fs.readFileSync(__dirname + "/integration-spec.yaml").toString(),
  spec = yaml.load(raw);

spec = spec.slice(0, 5); // DEBUG!!!

spec.forEach(function (test) {
  var testCaseName = test.label || test.url;

  describe(testCaseName, () => {
    const url = test.url[0] == "/" ? WEBROOT + test.url : test.url;

    // assert the expected errors
    if (test.error) {
      it("should reject a promise", async () => {
        try {
          await phantomas(url, test.options || {});
        } catch (err) {
          assert.ok(err instanceof Error);

          if (err instanceof String) {
            assert.ok(
              err.message.indexOf(test.error) === 0,
              test.error + " should be raised, got: " + err.message
            );
          }
        }
      });

      return;
    }

    it("should resolve a promise and get results", async () => {
      const promise = phantomas(url, test.options || {});

      // if (test.assertFunction) {
      //   extras[test.assertFunction](promise, batch[batchName]);
      // }

      const results = await promise;

      assert.ok(
        !(results instanceof Error),
        "No error should be thrown: got " + results
      );
      assert.ok(
        results.getMetric instanceof Function,
        "Results wrapper should be passed"
      );

      // check metrics
      Object.keys(test.metrics || {}).forEach((name) => {
        assert.strictEqual(
          results.getMetric(name),
          test.metrics[name],
          `Checking metric ${name}`
        );
      });

      // check offenders
      Object.keys(test.offenders || {}).forEach((name) => {
        assert.deepStrictEqual(
          results.getOffenders(name),
          test.offenders[name],
          `Checking offenders for ${name}`
        );
      });
    });
  });
});
