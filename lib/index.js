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
	debug('Options: %s', JSON.stringify(opts));

	// options handling
	options = util._extend({}, opts || {}); // use util._extend to avoid #563
	options.url = options.url || url || false;

	// log emitted events
	events._emit = events.emit;
	events.log = require('debug')('phantomas:events');
	events.emit = function() {
		this.log('emit: %s', arguments[0]);
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
			const page = await browser.init();

			// TODO: prepare a small instance object that will be passed to modules and extensions on init
			const scope = {
				getParam: () => false, // TODO
				getVersion: () => VERSION,
				
				emit: events.emit.bind(events),
				on: events.on.bind(events),
				once: events.once.bind(events),

				addOffender: results.addOffender.bind(results),
				incrMetric: results.incrMetric.bind(results),
				setMetric: results.setMetric,

				// @see https://github.com/GoogleChrome/puppeteer/blob/v1.11.0/docs/api.md#pageevaluatepagefunction-args
				evaluate: page.evaluate.bind(page),

				// @see https://github.com/GoogleChrome/puppeteer/blob/v1.11.0/docs/api.md#pageevaluateonnewdocumentpagefunction-args
				injectJs: async (script) => {
					const debug = require('debug')('phantomas:injectJs'),
						preloadFile = require('fs').readFileSync(script, 'utf8');

					await page.evaluateOnNewDocument(preloadFile);

					debug(script + ' JavaScript file has been injected into page scope');
				},
			};

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
				debug(type + ' [' + args + ']');

				switch(type) {
					case 'incrMetric':
						scope.incrMetric.apply(scope, args);
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
			events.emit('init', browser);

			await browser.visit(url);

			// resolve our run
			await browser.close();

			// your last chance to add metrics
			events.emit('report');

			resolve(results);
		}
		catch(ex) {
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
