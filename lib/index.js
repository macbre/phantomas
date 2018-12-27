/**
 * phantomas CommonJS module
 */
'use strict';

var debug = require('debug')('phantomas:core'),
	emitter = require('events').EventEmitter,
	puppeteer = require("puppeteer"),
	path = require('path'),
	util = require('util'),
	VERSION = require('./../package').version;

/**
 * Main CommonJS module entry point
 */
function phantomas(url, opts) {
	var events = new emitter(),
		browser, options;

	debug('OS: %s %s', process.platform, process.arch);
	debug('Node.js: %s', process.version);
	debug('Puppeteer: preferred revision, r%s installed in %s', puppeteer._launcher._preferredRevision, puppeteer._projectRoot);
	debug('URL: <%s>', url);
	debug('Options: %s', JSON.stringify(opts));

	// options handling
	options = util._extend({}, opts || {}); // use util._extend to avoid #563
	options.url = options.url || url || false;

	debug('Environment: %j', process.env);

	// set up Puppeteer
	browser = new (require('./browser'));

	// promise handling
	var promise = new Promise(async (resolve, reject) => {
		try {
			await browser.init();
			resolve('foo');
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
