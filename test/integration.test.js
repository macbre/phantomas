/**
 * Integration tests using server-start.sh script
 */
"use strict";

const { beforeAll, describe, it, test } = require("@jest/globals");

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

      await new Promise((resolve) => {
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
const raw = fs.readFileSync(__dirname + "/integration-spec.yaml").toString();

/** @type {array} */
let spec = yaml.load(raw);

// spec = spec.slice(65, 75); // DEBUG!!!

describe("Integration tests", () => {
  spec.forEach(function (test) {
    const testCaseName = test.label || test.url;
    const url = test.url[0] == "/" ? WEBROOT + test.url : test.url;

    // assert the expected errors
    if (test.error) {
      describe(testCaseName, () => {
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
      });

      return;
    }

    // do not run flaky tests
    if (test.flaky) {
      describe.skip(testCaseName, () => {
        it(test.flaky, () => {});
      });
      return;
    }

    describe(testCaseName, () => {
      let promise, results;

      beforeAll(async () => {
        promise = phantomas(url, test.options || {});

        // take additional logic for this test from integration-test-extra.js module
        if (test.assertFunction) {
          extras[test.assertFunction](promise);
        }

        results = await promise;
      });

      it("should get results from a promise", async () => {
        assert.ok(
          !(results instanceof Error),
          "No error should be thrown: got " + results
        );
        assert.ok(
          results.getMetric instanceof Function,
          "Results wrapper should be passed"
        );
      });

      // check metrics
      Object.keys(test.metrics || {}).forEach((name) => {
        it(`should have "${name}" metric set properly`, () => {
          assert.strictEqual(results.getMetric(name), test.metrics[name]);
        });
      });

      // check offenders
      Object.keys(test.offenders || {}).forEach((name) => {
        it(`should have offenders for "${name}" metric set properly`, () => {
          assert.notStrictEqual(
            results.getOffenders(name),
            test.offenders[name]
          );
        });
      });
    });
  });
});
