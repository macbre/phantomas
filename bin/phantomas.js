#!/usr/bin/env node

/**
 * Headless Chromium-based web performance metrics collector and monitoring tool
 *
 * Run "node phantomas.js" to get help
 *
 * @see https://github.com/macbre/phantomas
 */
"use strict";

const { getProgram, parseArgv } = require("./program"),
  phantomas = require(".."),
  debug = require("debug")("phantomas:cli");

var url = "";

// parse command line arguments
let options = parseArgv(process.argv);

// --url is mandatory -> show help
if (typeof options.url !== "string" && typeof options.config === "undefined") {
  debug("URL not provided - show help and leave");
  getProgram().outputHelp();
  process.exitCode = 1;
  return;
}

url = options.url;
debug("url: %s", url);

delete options.url;

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
    console.error("" + err);
    process.exitCode = 2;
  })
  .then(async (results) => {
    debug("Calling the JSON reporter...");
    debug("Metrics: %j", results.getMetrics());

    // TODO: handle more reporters
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
