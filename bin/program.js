const debug = require("debug")("phantomas:cli:program");
const phantomas = require("..");
const { decamelizeOptions } = require("./utils");

const { Command } = require("commander");

function getProgram() {
  const program = new Command();

  // define options
  program
    .name("phantomas")
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

    // Client options
    .option("--phone", "force viewport and user agent of a mobile phone")
    .option("--tablet", "force viewport and user agent of a tablet")
    .option("--viewport <width x height>", "viewport dimensions", "800x600")
    .option("--user-agent <user agent>", "provide a custom user agent")

    // HTTP options
    .option(
      "--auth-user <user>",
      "sets the user name used for HTTP authentication"
    )
    .option(
      "--auth-pass <password>",
      "sets the password used for HTTP authentication"
    )
    .option(
      "--cookie <cookies>",
      'document.cookie formatted string for setting a single cookie (e.g. "bar=foo;domain=url")'
    )
    .option(
      "--cookies-file <file>",
      "specifies the file name to store the persistent Cookies"
    )
    .option(
      "--ignore-ssl-errors",
      "ignores SSL errors, such as expired or self-signed certificate errors"
    )
    .option(
      "--proxy <host:port>",
      "specifies the proxy server to use (e.g. --proxy=192.168.1.42:8080)"
    )
    .option(
      "--proxy-auth <username:password>",
      "specifies the authentication information for the proxy"
    )
    .option(
      "--proxy-type <type>",
      "specifies the type of the proxy server [http|socks5|none]"
    )
    .option(
      "--ssl-protocol <protocol>",
      "sets the SSL protocol for secure connections [sslv3|sslv2|tlsv1|any]"
    )

    // Runtime options
    .option(
      "--allow-domain <domain>",
      "allow requests to given domain(s) - aka whitelist [domain],[domain],..."
    )
    .option(
      "--block-domain <domain>",
      "disallow requests to given domain(s) - aka blacklist [domain],[domain],..."
    )
    .option(
      "--disable-js",
      "disable JavaScript on the page that will be loaded"
    )
    .option("--no-externals", "block requests to 3rd party domains")
    .option(
      "--post-load-delay <N>",
      "wait X seconds before generating a report"
    )
    .option("--scroll", "scroll down the page when it's loaded")
    .option("--spy-eval", "report calls to eval()")
    .option("--stop-at-onload", "stop phantomas immediately after onload event")
    .option("--timeout <seconds>", "timeout for phantomas run", 15)
    .option(
      "--wait-for-event <event>",
      "wait for a given phantomas event before generating a report"
    )
    .option(
      "--wait-for-selector <selector>",
      "wait for an element matching given CSS selector before generating a report"
    )
    .option("--scroll", "scroll down the page when it's loaded")

    // Output and reporting
    .option("--analyze-css", "emit in-depth CSS metrics")
    .option("--colors", "forces ANSI colors even when output is piped")
    .option(
      "--film-strip",
      "register film strip when page is loading (a comma separated list of milliseconds can be passed)"
    )
    .option(
      "--film-strip-dir <dir>",
      "folder path to output film strip (default is ./filmstrip directory)"
    )
    .option("--har <file>", "save HAR to a given file")
    .option("--log <file>", "log to a given file")
    .option("--page-source", "save page source to file")
    .option(
      "--page-source-dir <dir>",
      "folder path to output page source (default is ./html directory)"
    )
    .option("--pretty", "render formatted JSON")
    .option(
      "--screenshot <file>",
      "render the viewport to a given file once fully loaded"
    )
    .option("--full-page-screenshot", "enlarge the screenshot to full page")
    .option("-s, --silent", "don't write anything to the console");

  // handle --config (issue #209)
  //program.setConfigFile("config");

  // handle env variables (issue #685)
  //program.setReplacementVars(process.env);

  return program;
}

function parseArgv(args) {
  const program = getProgram();

  // parse provided options
  debug("argv: %j", args);
  program.parse(args);

  // make sure options are not "camelCased" but "have-dashes" instead (issue #863)
  let options = decamelizeOptions(program.opts());
  debug("decamelzed opts: %j", options);

  // handle URL passed without --url option (#249)
  if (typeof options.url === "undefined" && args.length >= 3) {
    if (!args[2].startsWith("-")) {
      options.url = args[2];
    }
  }

  // handle --no-foo options
  options["no-externals"] = options.externals === false;
  delete options.externals;

  delete options.version;

  debug("opts: %j", options);
  return options;
}

module.exports = {
  getProgram,
  parseArgv,
};
