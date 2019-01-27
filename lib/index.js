/**
 * phantomas CommonJS module
 */
'use strict';

var Browser = require('./browser'),
	EventEmitter = require('events').EventEmitter,
	debug = require('debug')('phantomas:core'),
	loader = require('./loader'),
	puppeteer = require("puppeteer"),
	path = require('path'),
	Results = require('../core/results'),
	util = require('util'),
	VERSION = require('./../package').version;

/**
 * Main CommonJS module entry point
 * 
 * @param {string} url
 * @param {Object} opts
 * @returns {browser}
 */
function phantomas(url, opts) {
	var events = new EventEmitter(),
		browser, options;

	debug('OS: %s %s', process.platform, process.arch);
	debug('Node.js: %s', process.version);
	debug('phantomas: %s', VERSION);
	debug('Puppeteer: preferred revision r%s', puppeteer._launcher._preferredRevision);
	debug('URL: <%s>', url);

	// options handling
	options = util._extend({}, opts || {}); // use util._extend to avoid #563
	options.url = options.url || url || false;

	debug('Options: %s', JSON.stringify(options));

	// log emitted events
	events._emit = events.emit;
	events.log = require('debug')('phantomas:events');
	events.emit = function() {
		const eventName = arguments[0];
		if (eventName != 'scopeMessage') this.log('emit: %s', eventName);

		this._emit.apply(this, arguments);
	}

	events.setMaxListeners(100); // MaxListenersExceededWarning: Possible EventEmitter memory leak detected.

	var results = new Results();
	results.setUrl(url);
	results.setGenerator('phantomas v' + VERSION);

	// set up and run Puppeteer
	browser = new Browser();
	browser.bind(events);

	var promise = new Promise(async (resolve, reject) => {
		try {
			if (typeof options.url !== 'string') {
				return reject(Error('URL must be a string'));
			}

			const page = await browser.init(),
				debugScope = require('debug')('phantomas:scope:log');

			// promises to resolve before closing the page
			// see phantomas.awaitBeforeClose()
			var beforeCloseFunctions = [];

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

				// @see https://github.com/GoogleChrome/puppeteer/blob/v1.11.0/docs/api.md#pageevaluatepagefunction-args
				evaluate: page.evaluate.bind(page),

				// @see https://github.com/GoogleChrome/puppeteer/blob/v1.11.0/docs/api.md#pageselector-1
				querySelectorAll: async (selector) => {
					debug('querySelectorAll("%s")', selector)
					return page.$$(selector);
				},

				// @see https://github.com/GoogleChrome/puppeteer/blob/v1.11.0/docs/api.md#pageevaluateonnewdocumentpagefunction-args
				injectJs: async (script) => {
					const debug = require('debug')('phantomas:injectJs'),
						preloadFile = require('fs').readFileSync(script, 'utf8');

					await page.evaluateOnNewDocument(preloadFile);

					debug(script + ' JavaScript file has been injected into page scope');
				},

				// https://github.com/GoogleChrome/puppeteer/blob/v1.11.0/docs/api.md#framewaitforselectororfunctionortimeout-options-args
				awaitBeforeClose: (waitFunc) => {
					debug('Will wait for this function before closing: %s', waitFunc);
					beforeCloseFunctions.push(waitFunc);
				}
			};

			// pass phantomas options to page scope
			// https://github.com/GoogleChrome/puppeteer/blob/v1.11.0/docs/api.md#pageevaluateonnewdocumentpagefunction-args
			await page.evaluateOnNewDocument(options => {
				window.__phantomas_options = options;
			}, options);

			// expose the function that will pass events from page scope code into Node.js layer
			// @see https://github.com/GoogleChrome/puppeteer/blob/v1.11.0/docs/api.md#pageexposefunctionname-puppeteerfunction
			await page.exposeFunction('__phantomas_emit', scope.emit);

			// Inject helper code into the browser's scope
			events.on('init', () => {
				scope.injectJs(__dirname + '/../core/scope.js');
			});

			// bind to sendMsg calls from page scope code
			events.on('scopeMessage', (type, args) => {
				const debug = require('debug')('phantomas:core:scopeEvents');
				// debug(type + ' [' + args + ']');

				switch(type) {
					case 'addOffender':
					case 'incrMetric':
					case 'log':
					case 'setMetric':
						scope[type].apply(scope, args);
						break;

					default:
						debug('Unrecognized event type: ' + type);
				}
			});

			// load modules and extensions
			debug('Loading core modules...');
			loader.loadCoreModules(scope);

			debug('Loading extensions...');
			loader.loadExtensions(scope);

			debug('Loading modules...');
			loader.loadModules(scope);

			// browser's scope and modules are set up, you can now use it in your modules
			events.emit('init', browser, page);

			// https://github.com/GoogleChrome/puppeteer/blob/v1.11.0/docs/api.md#pagegotourl-options
			const waitUntil = options['wait-for-network-idle'] ? 'networkidle0' : undefined,
				timeout = options.timeout;

			await browser.visit(url, waitUntil, timeout);

			// wait for promises registered via phantomas.awaitBeforeClose
			var promises = [];

			// execute each registered function to get the promise we need to wait for,
			// pass page object to each function
			beforeCloseFunctions.forEach(func => {
				promises.push(func(page));
			});
			await Promise.all(promises);

			// resolve our run
			await browser.close();

			// your last chance to add metrics
			events.emit('report');

			resolve(results);
		}
		catch(ex) {
			// close the browser before leaving here, otherwise subsequent instances will have problems
			await browser.close();
			reject(ex);
		}
	});

	promise.on = events.on.bind(events);

	return promise;
}

phantomas.metadata = require(__dirname + '/metadata/metadata.json');
phantomas.path = path.normalize(__dirname + '/..');
phantomas.version = VERSION;

module.exports = phantomas;
