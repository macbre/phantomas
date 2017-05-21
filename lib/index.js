/**
 * phantomas CommonJS module
 */
'use strict';

var debug = require('debug')('phantomas'),
	emitter = require('events').EventEmitter,
	Engines = require('./engines'),
	net = require('net'),
	path = require('path'),
	Q = require('q'),
	Stream = require('stream'),
	util = require('util'),
	VERSION = require('./../package').version;

/**
 * Return temporary directory for the current phantomas run
 */
function getTmpDir() {
	var tmpdir = require('os').tmpdir(),
		uuidV4 = require('uuid/v4');

	// example: /tmp/phantomas/58aea8b5-2c97-48ee-9885-fcd81d38561f/
	return tmpdir + '/phantomas/' + uuidV4() + '/';
}

/**
 * Main CommonJS module entry point
 *
 * FIXME: split into seperate functions
 */
function phantomas(url, opts, callback) {
	var engineArgs = [],
		deferred = Q.defer(),
		events = new emitter(),
		proc,
		engine,
		data = '',
		tmpDir,
		options;

	// options can be omitted
	if (typeof opts === 'function') {
		callback = opts;
		opts = {};
	}

	debug('nodejs %s', process.version);
	debug('phantomas v%s installed in %s', VERSION, phantomas.path);
	debug('URL: <%s>', url);
	debug('Options: %s', JSON.stringify(opts));

	// options handling
	options = util._extend({}, opts || {}); // use util._extend to avoid #563
	options.url = options.url || url || false;

	// generate unique temporary directory name
	// and pass it to PhantomJS script as an environment variable
	tmpDir = getTmpDir();
	process.env.PHANTOMAS_TMP_DIR = tmpDir;

	// path to analyze-css main script (#664)
	process.env.ANALYZE_CSS_BIN = require('analyze-css').pathBin;

	debug('Environment: %j', process.env);

	// select the engine and run phantomas
	engine = new Engines(options);
	proc = engine.run(phantomas.path + '/scripts/phantomas.js');

	debug('Spawned with pid #%d', proc.pid);

	proc.on('error', function(err) {
		debug('Error: %s', err);
	});

	/**
	 * Set up IPC channel
	 *
	 * It will receive JSON-formatted messages from phantomjs / slimerjs process
	 * (send over stdout stream of spawned process) and emit events
	 */
	var ipc = new(require('./ipc'))(proc.stdout);
	ipc.setEventEmitter(events);

	// pipe log messages to error stream
	var errStream = new Stream.Readable();
	errStream._read = function() {
		return true;
	};

	ipc.on('log', function(msg) {
		errStream.push(msg + "\n");
	});

	// push raw messages from stderr (PhantomJS run in --debug=true mode) to errStream
	proc.stderr.on('data', function(data) {
		var msg = data.toString().
		split('[DEBUG]').pop().
		trim();

		errStream.push('Debug: ' + msg + "\n");
	});

	// handle loading progress
	var progressDebug = require('debug')('phantomas:progress');

	ipc.on('progress', function(progress, inc) {
		progressDebug('%d% (+%d%)', progress, inc);
		deferred.notify(progress / 100);
	});

	// handle --socket <UNIX IPC socket> option
	// @see http://nodejs.org/api/net.html#net_new_net_socket_options
	if (typeof options.socket === 'string') {
		var socket,
			socketName = options.socket;

		// @see http://nodejs.org/api/net.html#net_net_connect_options_connectionlistener
		debug('Using UNIX socket for IPC: %s', socketName);

		socket = new net.Socket();
		socket.connect(socketName, function() {
			debug('Socket connected');
		});

		socket.on('error', function(err) {
			debug('Socket error: %s', err);

			throw 'Socket "' + socketName + '" error - ' + err;
		});

		ipc.on('_msg', function(data) {
			// example: ["metric","bodyHTMLSize",75193]
			socket.write(JSON.stringify(data) + "\n");
		});
	}

	// get JSON results
	ipc.on('json', function(raw) {
		data = raw;
	});

	// failures handling
	var exitCode = 0;
	ipc.on('exit', function(code, msg) {
		if ((code > 0) && (typeof msg === 'string')) {
			exitCode = code;
			errStream.push('phantomas: (' + code + ') ' + msg + "\n");
		}
	});

	// process results
	proc.on('close', function(code) {
		var debug = require('debug')('phantomas:results'),
			json,
			results;

		// PhantomJS made a core dump (#382)
		if (code === null) {
			code = 255; // EXIT_ERROR
			errStream.push('phantomas: (' + code + ') Engine crashed unexpectedly\n');
		}

		// apply the code from 'exit' event
		code = code || exitCode;

		debug('Process returned code #%d', code);

		// (try to) parse to JSON
		try {
			json = JSON.parse(data);
		} catch (ex) {
			debug('Error when parsing JSON (%s): "%s"', ex, data);
			errStream.push(data);

			// Return EXIT_ERROR when JSON can not be parsed (and there was no error earlier)
			if (code < 250) {
				code = 255;
			}

			errStream.push('phantomas: (' + code + ') Failed to parse JSON with the results\n');
		}

		// finish the readable stream
		errStream.emit('end');

		if (typeof json !== 'undefined') {
			events.emit('data', json);

			// wrap JSON data into results object
			results = new(require('../core/results'))(json);
			events.emit('results', results);
		}

		if (code > 0) {
			if (events.listeners('error').length > 0) {
				events.emit('error', code);
			}
		}

		if (typeof callback === 'function') {
			var err = code === 0 ? null : new Error(code);
			callback(err, json, results);
		}

		// either reject or resolve the promise
		if (code > 250) {
			debug('Rejecting a promise with %d exit code', code);
			deferred.reject({
				code: code,
				json: json,
				results: results
			});
		} else {
			debug('Resolving a promise with %d exit code', code);
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
