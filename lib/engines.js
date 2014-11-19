/**
 * Provides abstractor layer for using different engines to run phantomas
 */
'use strict';

var debug = require('debug')('phantomas:engines'),
	spawn = require('child_process').spawn,
	VERSION = require('../package').version;

function engines(options) {
	/* jshint validthis: true */
	this.options = options;

	//--debug can be either 'true' or 'false'
	this.options.debug = (this.options.debug === true) ? 'true' : 'false';

	// engines storage
	this.engines = {};
	['webkit', 'gecko'].forEach(this.registerEngine, this);
}

engines.prototype.registerEngine = function(engineName) {
	var def = require('./engines/' + engineName);
	this.engines[engineName] = def;

	debug('Engine "%s": %s v%s installed in %s', engineName, def.name, def.version, def.path);
};

engines.prototype.getEngines = function() {
	return Object.keys(this.engines);
};

engines.prototype.getEngine = function(engine) {
	return this.engines[engine];
};

engines.prototype.run = function(scriptFile) {
	// select the engine
	var engines = this.getEngines(),
		engine = this.getEngine(engines[0]);

	// --engine=[gecko|webkit]
	if (typeof this.options.engine === 'string') {
		engine = this.getEngine(this.options.engine);

		if (typeof engine === 'undefined') {
			throw 'Engine "' + this.options.engine + '" not found!';
		}
	}
	// --gecko / --webkit
	else {
		engines.forEach(function(key) {
			if (this.options[key] === true) {
				engine = this.getEngine(key);
			}
		}, this);
	}

	// customize user agent
	if (typeof this.options['user-agent'] === 'undefined') {
		this.options['user-agent'] = "phantomas/" + VERSION + " (" + engine.getUserAgent() + "; " + process.platform + " " + process.arch + ")";
	}

	// build engine specific command-line arguments
	var engineArgs = [];

	Object.keys(this.options).forEach(function(key) {
		var val = this.options[key],
			nativeOptions = [
				'cookies-file',
				'debug',
				'ignore-ssl-errors',
				'ssl-protocol',
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

	debug('Running %s (using %s)', scriptFile, engine.name);
	debug('Passing phantomas options: %j', this.options);
	debug('Passing engine options: %j', engineArgs);

	// add a script to run
	engineArgs.push(scriptFile);

	// pass JSON encoded options
	engineArgs.push(JSON.stringify(this.options));

	// spawn the process
	var proc;

	if (typeof engine.spawn === 'function') {
		debug('Using custom spawn function');
		proc = engine.spawn(engine.path, engineArgs);
	} else {
		proc = spawn(engine.path, engineArgs, {
			env: process.env
		});
	}

	return proc;
};

// public API
module.exports = engines;
