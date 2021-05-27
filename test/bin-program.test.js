/**
 * Integration tests using server-start.sh script
 */
const assert = require("assert"),
  { parseArgv } = require("../bin/program");

const {test} = require('@jest/globals');

const DEFAULT_ARGV = ["/usr/bin/node", "/opt/phantomas/bin/phantomas.js"];

test("should provide defaults", () => {
  assert.deepStrictEqual(parseArgv(DEFAULT_ARGV), {
    viewport: "800x600",
    timeout: 15,
    "no-externals": false,
  });
});

test("should handle dashed-names", () => {
  assert.deepStrictEqual(
    parseArgv(DEFAULT_ARGV.concat(["--user-agent=Foo/Bar (test)"])),
    {
      viewport: "800x600",
      timeout: 15,
      "no-externals": false,
      "user-agent": "Foo/Bar (test)",
    }
  );
});

test("should handle --dashed-flags", () => {
  assert.deepStrictEqual(
    parseArgv(DEFAULT_ARGV.concat(["--ignore-ssl-errors", "--phone"])),
    {
      viewport: "800x600",
      timeout: 15,
      "no-externals": false,
      "ignore-ssl-errors": true,
      phone: true,
    }
  );
});

test("should handle --url option", () => {
  assert.deepStrictEqual(
    parseArgv(DEFAULT_ARGV.concat(["--url=http://example.foo/bar", "--phone"])),
    {
      viewport: "800x600",
      timeout: 15,
      "no-externals": false,
      url: "http://example.foo/bar",
      phone: true,
    }
  );
});

test("should detect URL without --url option", () => {
  assert.deepStrictEqual(
    parseArgv(DEFAULT_ARGV.concat(["http://example.foo/bar", "--tablet"])),
    {
      viewport: "800x600",
      timeout: 15,
      "no-externals": false,
      url: "http://example.foo/bar",
      tablet: true,
    }
  );
});

test("should handle --no-externals", () => {
  assert.deepStrictEqual(parseArgv(DEFAULT_ARGV.concat(["--no-externals"])), {
    viewport: "800x600",
    timeout: 15,
    "no-externals": true,
  });
});
