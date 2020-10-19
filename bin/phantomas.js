#!/usr/bin/env node

/**
 * Headless Chromium-based web performance metrics collector and monitoring tool
 *
 * Run "node phantomas.js" to get help
 *
 * @see https://github.com/macbre/phantomas
 */
"use strict";

const { program } = require("commander"),
  phantomas = require(".."),
  debug = require("debug")("phantomas:cli");

var url = "";

// parse options
program
  .description(
    "Headless Chromium-based web performance metrics collector and monitoring tool"
  )
  .version(phantomas.version)
  .usage("--url <url> [options]")

  //
  // https://www.npmjs.com/package/commander#common-option-types-boolean-and-value
  //

  // mandatory
  .option("--url <url>", "Set URL to work with")

  .option("-v, --verbose", "print debug messages to the console")
  .option("-d, --debug", "run phantomas in debug mode")
  .option(
    "--modules <modules>",
    "run selected modules only [moduleOne],[moduleTwo],..."
  )
  .option(
    "--include-dirs <dirs>",
    "load modules from specified directories [dirOne],[dirTwo],..."
  )
  .option(
    "--skip-modules <modules>",
    "skip selected modules [moduleOne],[moduleTwo],..."
  )

  // .option(
  //   "config",
  //   "uses JSON or YAML-formatted config file to set parameters"
  // )
  // .string("config")
  // optional params

  //.header("Client options")
  .option("--phone", "force viewport and user agent of a mobile phone")
  .option("--tablet", "force viewport and user agent of a tablet")
  .option("--viewport <width x height>", "viewport dimensions", "1280x1024")
  .option("--user-agent <user agent>", "provide a custom user agent");
/**
  .header("HTTP options")
  .option("auth-user", "sets the user name used for HTTP authentication")
  .option("auth-pass", "sets the password used for HTTP authentication")
  .option(
    "cookie",
    'document.cookie formatted string for setting a single cookie (e.g. "bar=foo;domain=url")'
  )
  .option(
    "cookies-file",
    "specifies the file name to store the persistent Cookies"
  )
  .option(
    "ignore-ssl-errors",
    "ignores SSL errors, such as expired or self-signed certificate errors"
  )
  .option(
    "proxy",
    "specifies the proxy server to use (e.g. --proxy=192.168.1.42:8080)"
  )
  .option(
    "proxy-auth",
    "specifies the authentication information for the proxy (e.g. --proxy-auth=username:password)"
  )
  .option(
    "proxy-type",
    "specifies the type of the proxy server [http|socks5|none]"
  )
  .option(
    "ssl-protocol",
    "sets the SSL protocol for secure connections [sslv3|sslv2|tlsv1|any]"
  )
  .default("ssl-protocol", "any")
  .header("Runtime options")
  .option(
    "allow-domain",
    "allow requests to given domain(s) - aka whitelist [domain],[domain],..."
  )
  .option(
    "block-domain",
    "disallow requests to given domain(s) - aka blacklist [domain],[domain],..."
  )
  .option("disable-js", "disable JavaScript on the page that will be loaded")
  .boolean("disable-js")
  .option("no-externals", "block requests to 3rd party domains")
  .boolean("no-externals")
  .option("post-load-delay", "wait X seconds before generating a report")
  .option("scroll", "scroll down the page when it's loaded")
  .boolean("scroll")
  .option("spy-eval", "report calls to eval()")
  .boolean("spy-eval")
  .option("stop-at-onload", "stop phantomas immediately after onload event")
  .boolean("stop-at-onload")
  .option("timeout", "timeout for phantomas run")
  .default("timeout", 15)
  .option(
    "wait-for-event",
    "wait for a given phantomas event before generating a report"
  )
  .option(
    "wait-for-selector",
    "wait for an element matching given CSS selector before generating a report"
  )
  .option("scroll", "scroll down the page when it's loaded")
  .boolean("scroll")
  .option("socket", "[experimental] use provided UNIX socket for IPC")
  .header("Output and reporting")
  .option("analyze-css", "[experimental] emit in-depth CSS metrics")
  .boolean("analyze-css")
  .option("colors", "forces ANSI colors even when output is piped")
  .boolean("colors")
  .option(
    "film-strip",
    "register film strip when page is loading (a comma separated list of milliseconds can be passed)"
  )
  .boolean("film-strip")
  .option(
    "film-strip-dir",
    "folder path to output film strip (default is ./filmstrip directory)"
  )
  .option("har", "save HAR to a given file")
  .option("log", "log to a given file")
  .option("page-source", "[experimental] save page source to file")
  .boolean("page-source")
  .option(
    "page-source-dir",
    "[experimental] folder path to output page source (default is ./html directory)"
  )
  .option("reporter", "output format / reporter")
  .default("reporter", "plain")
  .alias("reporter", "R")
  .alias("reporter", "format")
  .option("screenshot", "render fully loaded page to a given file")
  .option("silent", "don't write anything to the console")
  .boolean("silent");
 */

// handle --config (issue #209)
//program.setConfigFile("config");

// handle env variables (issue #685)
//program.setReplacementVars(process.env);

// parse it
program.parse(process.argv);
var options = program.opts();

debug("argv: %j", process.argv);
debug("opts: %j", options);

// handle URL passed without --url option (#249)
if (typeof options.url === "undefined" && process.argv.length >= 3) {
  if (process.argv[2].indexOf("-") < 0) {
    options.url = process.argv[2];
  }
}

// --url is mandatory -> show help
if (typeof options.url !== "string" && typeof options.config === "undefined") {
  debug("URL not provided - show help and leave");
  console.log(program.helpInformation());
  process.exit(255);
}

url = options.url;
debug("url: %s", url);

delete options.url;
delete options.version;

// handle --no-foo options
options["no-externals"] = options.externals === false;
delete options.externals;

// add env variable to turn off ANSI colors when needed (#237)
// suppress this behaviour by passing --colors option (issue #342)
if (!process.stdout.isTTY && options.colors !== true) {
  debug("ANSI colors turned off");
  process.env.BW = 1;
}

// spawn phantomas process
phantomas(url, options)
  .catch((err) => {
    debug("Error: %s", err);
    process.exit(1);
  })
  .then(async (results) => {
    debug("Calling a reporter...");
    debug("Metrics: %j", results.getMetrics());

    const reporter = require("../reporters/json")(results, options);
    const res = await reporter.render();

    const needDrain = !process.stdout.write(res);

    // If a stream.write(chunk) call returns false, then the 'drain' event will indicate when it is appropriate to begin writing more data to the stream.
    // @see #596
    if (needDrain) {
      debug("Need to wait for stdout to be fully flushed...");
      // process.stdout.on('drain');
    }
  });
