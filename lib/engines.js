/**
 * Provides abstractor layer for using different engines to run phantomas
 */
'use strict';

var debug = require('debug')('phantomas:engines'),
	spawn = require('child_process').spawn,
	phantomjs = require('phantomjs'),
	slimerjs = require('slimerjs'),
	VERSION = require('../package').version;

function engines(options) {
        /* jshint validthis: true */
	this.options = options;

	//--debug can be either 'true' or 'false'
	this.options.debug = (this.options.debug === true) ? 'true' : 'false';

	// engines storage
	this.engines = {};

	// TODO: move it out from here
	debug('PhantomJS v%s installed in %s', phantomjs.version, phantomjs.path);
	debug('SlimerJS v%s installed in %s', slimerjs.version, slimerjs.path);
}

engines.prototype.run = function(scriptFile) {
	// engine specific command-line arguments
	var engineArgs = [];

	// TODO: select the engine
	var engine;

	if (this.options.gecko === true) {
		engine = slimerjs;
	}
	else {
		engine = phantomjs;
	}

	// TODO: customize user agent
	if (typeof this.options['user-agent'] === 'undefined') {
		this.options['user-agent'] = "phantomas/" + VERSION + " (PhantomJS/" + engine.version + "; " + process.platform + " " + process.arch + ")";
	}

	// build args
	Object.keys(this.options).forEach(function(key) {
		var val = this.options[key],
			nativeOptions = [
				'cookies-file',
				'debug',
				'ignore-ssl-errors',
				'proxy',
				'proxy-auth',
				'proxy-type'
			];

		if (val === false) {
			return;
		}

		// handle native PhantomJS options (#163)
		// @see http://phantomjs.org/api/command-line.html
		if (nativeOptions.indexOf(key) > -1) {
			engineArgs.push('--' + key + '=' + val);

			delete this.options[key];
		}
	}, this);

	// add a script to run
	engineArgs.push(scriptFile);

	// pass JSON encoded options
	engineArgs.push(JSON.stringify(this.options));

	debug('Running %s (using %s)', scriptFile, engine.path);
	debug('Passing phantomas options: %j', this.options);

	// spawn the process
	return spawn(engine.path, engineArgs, {
		env: process.env
	});
};

// public API
module.exports = engines;
