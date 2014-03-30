/**
 * phantomas CommonJS module
 */
'use strict';

var debug = require('debug')('phantomas'),
	emitter = require('events').EventEmitter,
	spawn = require('child_process').spawn,
	path = require('path'),
	phantomjs = require('phantomjs'),
	VERSION = require('./../package').version;

function phantomas(url, options, callback) {
	var args = [],
		phantomJsArgs = [],
		events = new emitter(),
		path = '',
		proc,
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
	debug('phantomas v%s installed in %s', VERSION, phantomas.path);
	debug('URL: <%s>', url);
	debug('Options: %s', JSON.stringify(options));

	// options handling
	options = options || {};
	options.url = options.url || url || false;

	// build path to PhantomJS
	path = phantomjs.path;
	args.push(__dirname + '/../scripts/phantomas.js');

	// add env variable to turn off ANSI colors when needed (#237)
	if (!process.stdout.isTTY) {
		debug('ANSI colors turned off');
		spawnOptions.env.BW = 1;
	}

	// build args
	Object.keys(options).forEach(function(key) {
		var val = options[key],
			nativeOptions = [
				'cookies-file',
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
			phantomJsArgs.push('--' + key + '=' + val);
		}
		else {
			args.push('--' + key);

			if (val !== true) {
				args.push(val);
			}
		}
	});

	// add native PhantomJS options
	args = phantomJsArgs.concat(args);

	debug('Running %s %s', path, args.join(' '));

	// spawn the process
	proc = spawn(path, args, spawnOptions);

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

	// pipe log messages to error stream and emit an event
	var errStream = new (require('stream').Readable)();
	errStream.on('error', function() {});

	ipc.on('log', function(msg) {
		errStream.push(msg + "\n");
		events.emit('log', msg);
	});

	// handle loading progress
	var progressDebug = require('debug')('phantomas:progress');

	ipc.on('progress', function(progress, inc) {
		progressDebug('%d% (+%d%)', progress, inc);
		events.emit('progress', progress, inc);
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
			debug('Error when parsing JSON (%s): <%s>', ex, data);
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
	});

	return {
		pid: proc.pid,
		stdout: proc.stdout,
		stderr: errStream,
		on: events.on.bind(events)
	};
}

phantomas.metadata = require(__dirname + '/metadata/metadata.json');
phantomas.path = path.normalize(__dirname + '/..');
phantomas.version = VERSION;

module.exports = phantomas;
