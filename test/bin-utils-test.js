/**
 * Integration tests using server-start.sh script
 */
const vows = require("vows"),
  assert = require("assert"),
  { decamelizeOptions } = require("../bin/utils");

vows
  .describe("bin utils")
  .addBatch({
    decamelizeOptions: {
      topic: function () {
        return decamelizeOptions({
          url: "http://foo.com",
          userAgent: "foo/bar",
        });
      },
      "should decamelize options": function (opts) {
        assert.deepStrictEqual(opts, {
          url: "http://foo.com",
          "user-agent": "foo/bar",
        });
      },
    },
  })
  .export(module);
