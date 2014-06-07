/**
 * phantomas CommonJS module
 */
'use strict';

var debug = require('debug')('phantomas'),
	emitter = require('events').EventEmitter,
	spawn = require('child_process').spawn,
	path = require('path'),
	phantomjs = require('phantomjs'),
	slimerjs = require('slimerjs'),
	Q = require('q'),
	VERSION = require('./../package').version;

function phantomas(url, options, callback) {
	var engineArgs = [],
		deferred = Q.defer(),
		events = new emitter(),
		proc,
		engine,
		spawnOptions = {
			env: process.env
		},
		data = '';

	// options can be omitted
	if (typeof options === 'function') {
		callback = options;
		options = {};
	}

	debug('nodejs %s', process.version);
	debug('PhantomJS v%s installed in %s', phantomjs.version, phantomjs.path);
	debug('SlimerJS v%s installed in %s', slimerjs.version, slimerjs.path);
	debug('phantomas v%s installed in %s', VERSION, phantomas.path);
	debug('URL: <%s>', url);
	debug('Options: %s', JSON.stringify(options));

	// options handling
	options = options || {};
	options.url = options.url || url || false;

	options.debug = (options.debug === true) ? 'true' : 'false'; //--debug can be either 'true' or 'false'

	// TODO: select the engine
	engine = phantomjs;

	// build args
	Object.keys(options).forEach(function(key) {
		var val = options[key],
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

			delete options[key];
		}
	});

	// add a script to run
	var scriptFile = phantomas.path + '/scripts/phantomas.js';
	engineArgs.push(scriptFile);

	// pass JSON encoded options
	engineArgs.push(JSON.stringify(options));

	debug('Running %s (using %s)', scriptFile, engine.path);
	debug('Passing phantomas options: %j', options);

	// spawn the process
	proc = spawn(engine.path, engineArgs, spawnOptions);

	debug('Spawned with pid #%d', proc.pid);

	proc.on('error', function(err) {
		debug('Error: %s', err);
	});

	// put together JSON from stdout
	proc.stdout.on('data', function(buf) {
		data += buf;
	});

	// set up IPC
	var ipc = new (require('./ipc'))(proc.stderr);
	ipc.setEventEmitter(events);

	// pipe log messages to error stream
	var errStream = new (require('stream').Readable)();
	errStream.on('error', function() {});

	ipc.on('log', function(msg) {
		errStream.push(msg + "\n");
	});

	// handle loading progress
	var progressDebug = require('debug')('phantomas:progress');

	ipc.on('progress', function(progress, inc) {
		progressDebug('%d% (+%d%)', progress, inc);
		deferred.notify(progress / 100);
	});

	// handle page loading milestones (#240)
	var milestoneDebug = require('debug')('phantomas:milestone');

	ipc.on('metric', function(metric, value) {
		switch(metric) {
			case 'timeToFirstByte':
			case 'timeToLastByte':
			case 'onDOMReadyTime':
			case 'windowOnLoadTime':
				milestoneDebug('%s: %d ms', metric, value);
				events.emit('milestone', metric, value);
				break;
		}
	});

	// failures handling
	ipc.on('exit', function(code, msg) {
		if ((code > 0) && (typeof msg === 'string')) {
			errStream.push('phantomas: (' + code + ') ' + msg + "\n");
		}
	});

	// process results
	proc.on('close', function(code) {
		var debug = require('debug')('phantomas:results'),
			json = false,
			results = false;

		debug('Process returned code #%d', code);
		debug('JSON: %s', data);

		// (try to) parse to JSON
		try {
			json = JSON.parse(data);
		}
		catch(ex) {
			debug('Error when parsing JSON (%s)', ex);
			errStream.push(data);
		}

		if (json !== false) {
			events.emit('data', json);

			// wrap JSON data into results object
			results = new (require('../core/results'))(json);
			events.emit('results', results);
		}

		if (code > 0) {
			if (events.listeners('error').length > 0) {
				events.emit('error', code);
			}
		}

		if (typeof callback === 'function') {
			callback(code === 0 ? null : code, json, results);
		}

		// either reject or resolve the promise
		if (code > 250) {
			deferred.reject(code);
		}
		else {
			deferred.resolve({
				code: code,
				json: json,
				results: results
			});
		}
	});

	var promise = deferred.promise;

	promise.pid = proc.pid;
	promise.stdout = proc.stdout;
	promise.stderr = errStream;
	promise.on = events.on.bind(events);

	return promise;
}

phantomas.metadata = require(__dirname + '/metadata/metadata.json');
phantomas.path = path.normalize(__dirname + '/..');
phantomas.version = VERSION;

module.exports = phantomas;
