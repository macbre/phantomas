/**
 * phantomas CommonJS module
 */
'use strict';

var EventEmitter = require('events').EventEmitter,
	debug = require('debug')('phantomas:core'),
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

	// TODO: prepare a small instance object that will be passed to modules and extensions on init
	var results = new Results();
	results.setUrl(url);

	var scope = {
		on: events.on.bind(events),
		setMetric: results.setMetric,
		log: require('debug')('phantomas:module')
	};

	// TODO: set up modules and extensions
	var module = require('../modules/requestsStats/requestsStats');
	module.module(scope);

	// set up and run Puppeteer
	browser = new (require('./browser'))();
	browser.bind(events);

	var promise = new Promise(async (resolve, reject) => {
		try {
			await browser.init();
			await browser.visit(url);

			// your last chance to add metrics
			events.emit('report');

			// resolve our run
			await browser.close();
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
