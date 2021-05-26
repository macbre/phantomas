/**
 * Integration tests using server-start.sh script
 */
const assert = require("assert"),
  { decamelizeOptions } = require("../bin/utils");

test("should decamelize options", () => {
  const opts = decamelizeOptions({
    url: "http://foo.com",
    userAgent: "foo/bar",
  });

  assert.deepStrictEqual(opts, {
    url: "http://foo.com",
    "user-agent": "foo/bar",
  });
});
