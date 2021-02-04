/**
 * Integration tests using server-start.sh script
 */
"use strict";

var vows = require("vows"),
  assert = require("assert"),
  fs = require("fs"),
  yaml = require("js-yaml"),
  phantomas = require(".."),
  extras = require("./integration-test-extra");

var WEBROOT = "http://127.0.0.1:8888"; // see start-server.sh

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on("unhandledRejection", (err) => {
  throw err;
});

// run the test
var suite = vows.describe("Integration tests").addBatch({
  "test server": {
    topic: function () {
      var http = require("http"),
        self = this;

      http
        .get(WEBROOT + "/", function (res) {
          self.callback(null, res);
        })
        .on("error", self.callback);
    },
    "should be up and running": function (err, res) {
      assert.strictEqual(
        typeof res !== "undefined",
        true,
        "responses to the request"
      );
      assert.strictEqual(res.statusCode, 200, "responses with HTTP 200");
    },
  },
});

// register tests from spec file
var raw = fs.readFileSync(__dirname + "/integration-spec.yaml").toString(),
  spec = yaml.load(raw);

spec.forEach(function (test) {
  var batch = {},
    batchName = test.label || test.url;

  batch[batchName] = {
    topic: function () {
      const url = test.url[0] == "/" ? WEBROOT + test.url : test.url,
        promise = phantomas(url, test.options || {});

      promise
        .then((res) => this.callback(null, res))
        .catch((err) => this.callback(null, err));

      if (test.assertFunction) {
        extras[test.assertFunction](promise, batch[batchName]);
      }
    },
    "should be generated": (err, res) => {
      assert.ok(
        !(res instanceof Error),
        "No error should be thrown: got " + res
      );
      assert.ok(
        res.getMetric instanceof Function,
        "Results wrapper should be passed"
      );
    },
  };

  // check for errors
  if (test.error) {
    delete batch[batchName]["should be generated"];

    batch[batchName]["should reject a promise"] = (_, err) => {
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
      assert.ok(err instanceof Error);
      assert.ok(
        err.message.indexOf(test.error) === 0,
        test.error + " should be raised"
      );
    };
  }

  // check metrics
  Object.keys(test.metrics || {}).forEach(function (name) {
    batch[batchName][
      'should have "' + name + '" metric properly set'
    ] = function (err, results) {
      assert.ok(!(err instanceof Error), "Error should not be thrown: " + err);
      assert.strictEqual(results.getMetric(name), test.metrics[name]);
    };
  });

  // check offenders
  Object.keys(test.offenders || {}).forEach(function (name) {
    batch[batchName][
      'should have "' + name + '" offender(s) properly set'
    ] = function (err, results) {
      assert.ok(!(err instanceof Error), "Error should not be thrown: " + err);
      assert.deepStrictEqual(results.getOffenders(name), test.offenders[name]);
    };
  });

  suite.addBatch(batch);
});

suite.export(module);
