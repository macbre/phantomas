/**
 * phantomas CommonJS module
 */
"use strict";

const Browser = require("./browser"),
  EventEmitter = require("./AwaitEventEmitter"),
  debug = require("debug")("phantomas:core"),
  loader = require("./loader"),
  puppeteer = require("puppeteer"),
  path = require("path"),
  Results = require("../core/results"),
  VERSION = require("./../package").version;

/**
 * Main CommonJS module entry point
 *
 * @param {string} url
 * @param {Object} opts
 * @returns {browser}
 */
function phantomas(url, opts) {
  var events = new EventEmitter(),
    browser,
    options;

  debug("OS: %s %s", process.platform, process.arch);
  debug("Node.js: %s", process.version);
  debug("phantomas: %s", VERSION);
  debug(
    "Puppeteer: preferred revision r%s",
    puppeteer._launcher._preferredRevision
  );
  debug("URL: <%s>", url);

  // options handling
  options = Object.assign({}, opts || {}); // avoid #563
  options.url = options.url || url || false;

  debug("Options: %s", JSON.stringify(options));

  events.setMaxListeners(100); // MaxListenersExceededWarning: Possible EventEmitter memory leak detected.

  var results = new Results();
  results.setUrl(url);
  results.setGenerator("phantomas v" + VERSION);

  // set up and run Puppeteer
  browser = new Browser();
  browser.bind(events);

  var promise = new Promise(async (resolve, reject) => {
    try {
      if (typeof options.url !== "string") {
        return reject(Error("URL must be a string"));
      }

      const page = await browser.init(options),
        debugScope = require("debug")("phantomas:scope:log");

      // prepare a small instance object that will be passed to modules and extensions on init
      const scope = {
        getParam: (param, _default) => {
          return options[param] || _default;
        },
        getVersion: () => VERSION,

        emit: events.emit.bind(events),
        on: events.on.bind(events),
        once: events.once.bind(events),

        log: debugScope.bind(debug),

        addOffender: results.addOffender.bind(results),
        incrMetric: results.incrMetric.bind(results),
        setMetric: results.setMetric,
        addToAvgMetric: results.addToAvgMetric,

        getMetric: results.getMetric,

        // @see https://github.com/GoogleChrome/puppeteer/blob/v1.11.0/docs/api.md#pageevaluatepagefunction-args
        evaluate: page.evaluate.bind(page),

        // @see https://github.com/GoogleChrome/puppeteer/blob/v1.11.0/docs/api.md#pageselector-1
        querySelectorAll: async (selector) => {
          debug('querySelectorAll("%s")', selector);
          return page.$$(selector);
        },

        // @see https://github.com/GoogleChrome/puppeteer/blob/v1.11.0/docs/api.md#pageevaluateonnewdocumentpagefunction-args
        injectJs: async (script) => {
          const debug = require("debug")("phantomas:injectJs");

          // Make sure we're on an HTML document, not an XML document for example
          const prefix = "if (document.constructor.name === 'HTMLDocument') {",
            suffix = "}";

          const preloadFile =
            prefix + require("fs").readFileSync(script, "utf8") + suffix;

          await page.evaluateOnNewDocument(preloadFile);

          debug(script + " JavaScript file has been injected into page scope");
        },
      };

      // pass phantomas options to page scope
      // https://github.com/GoogleChrome/puppeteer/blob/v1.11.0/docs/api.md#pageevaluateonnewdocumentpagefunction-args
      await page.evaluateOnNewDocument((options) => {
        window.__phantomas_options = options;
      }, options);

      // expose the function that will pass events from page scope code into Node.js layer
      // @see https://github.com/GoogleChrome/puppeteer/blob/v1.11.0/docs/api.md#pageexposefunctionname-puppeteerfunction
      await page.exposeFunction("__phantomas_emit", scope.emit);

      // Inject helper code into the browser's scope
      events.on("init", () => {
        scope.injectJs(__dirname + "/../core/scope.js");
      });

      // bind to sendMsg calls from page scope code
      events.on("scopeMessage", (type, args) => {
        const debug = require("debug")("phantomas:core:scopeEvents");
        // debug(type + ' [' + args + ']');

        switch (type) {
          case "addOffender":
          case "incrMetric":
          case "log":
          case "setMetric":
            scope[type].apply(scope, args);
            break;

          default:
            debug("Unrecognized event type: " + type);
        }
      });

      // bind to a first response
      // and reject a promise if the first response is 4xx / 5xx HTTP error
      var firstResponseReceived = false;

      events.once("recv", async (entry) => {
        if (!firstResponseReceived && entry.status >= 400) {
          debug(
            "<%s> response code is HTTP %d %s",
            entry.url,
            entry.status,
            entry.statusText
          );

          // close the browser before leaving here, otherwise subsequent instances will have problems
          await browser.close();
          reject(
            new Error(
              "HTTP response code from <" + entry.url + "> is " + entry.status
            )
          );
        }

        firstResponseReceived = true;
      });

      // load modules and extensions
      debug("Loading core modules...");
      loader.loadCoreModules(scope);

      debug("Loading extensions...");
      loader.loadExtensions(scope);

      debug("Loading modules...");
      loader.loadModules(scope);

      await events.emit("init", page, browser.getPuppeteerBrowser()); // @desc Browser's scope and modules are set up, the page is about to be loaded

      // https://github.com/GoogleChrome/puppeteer/blob/v1.11.0/docs/api.md#pagegotourl-options
      const waitUntil = options["wait-for-network-idle"]
          ? "networkidle0"
          : undefined,
        timeout = options.timeout;

      await browser.visit(url, waitUntil, timeout);

      // resolve our run
      // https://github.com/GoogleChrome/puppeteer/blob/v1.11.0/docs/api.md#browserclose
      await events.emit("beforeClose", page); // @desc Called before the Chromium (and all of its pages) is closed
      await browser.close();

      // your last chance to add metrics
      await events.emit("report"); // @desc Called just before the phantomas results are returned to the caller

      resolve(results);
    } catch (ex) {
      debug("Exception caught: " + ex);
      debug(ex);

      // close the browser before leaving here, otherwise subsequent instances will have problems
      await browser.close();
      reject(ex);
    }
  });

  promise.on = events.on.bind(events);
  promise.once = events.once.bind(events);

  return promise;
}

phantomas.metadata = require(__dirname + "/metadata/metadata.json");
phantomas.path = path.normalize(__dirname + "/..");
phantomas.version = VERSION;

module.exports = phantomas;
