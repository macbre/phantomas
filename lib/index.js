/**
 * phantomas CommonJS module
 */
var debug = require('debug')('phantomas'),
	emitter = require('events').EventEmitter,
	spawn = require('child_process').spawn,
	phantomjs = require('phantomjs'),
	VERSION = require('./../package').version;

function phantomas(url, options, callback) {
	var args = [],
		phantomJsArgs = [],
		events = new emitter(),
		path = '',
		proc,
		data = '';

	// options can be omitted
	if (typeof options === 'function') {
		callback = options;
		options = {};
	}

	debug('nodejs %s', process.version);
	debug('PhantomJS v%s installed in %s', phantomjs.version, phantomjs.path);
	debug('phantomas v%s installed in %s', VERSION, __dirname);
	debug('URL: <%s>', url);
	debug('Options: %s', JSON.stringify(options));

	// options handling
	options = options || {};
	options.url = options.url || url || false;

	// build path to PhantomJS
	path = phantomjs.path;
	args.push(__dirname + '/../scripts/phantomas.js');

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
	proc = spawn(path, args);

	debug('Spawned with pid #%d', proc.pid);

	proc.on('error', function(err) {
		debug('Error: %s', err);
	});

	// gather data from stdout
	proc.stdout.on('data', function(buf) {
		data += buf;
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
		stderr: proc.stderr,
		on: events.on.bind(events)
	};
}

phantomas.path = __dirname;
phantomas.version = VERSION;

module.exports = phantomas;
