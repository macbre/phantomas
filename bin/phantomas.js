#!/usr/bin/env node
/**
 * PhantomJS-based web performance metrics collector
 *
 * Run "node phantomas.js" to get help
 *
 * @see https://github.com/macbre/phantomas
 */
'use strict';

var phantomas = require('..'),
	async = require('async'),
	debug = require('debug')('phantomas:cli'),
	program = require('optimist'),
	ProgressBar = require('progress'),
	options = {},
	program,
	runs,
	url = '';

// parse options
program
	.usage('PhantomJS-based web performance metrics collector\n\nphantomas <url> [options]')

	// mandatory
	.describe('url', 'Set URL to work with').string('url')

	// version / help
	.describe('version', 'Show version number and quit').boolean('version').alias('version', 'V')
	.describe('help', 'This help text').boolean('help').alias('help', 'h')

	// optional params
	.describe('allow-domain', 'allow requests to given domain(s) - aka whitelist [domain],[domain],...')
	.describe('auth-user', 'sets the user name used for HTTP authentication')
	.describe('auth-pass', 'sets the password used for HTTP authentication')
	.describe('block-domain', 'disallow requests to given domain(s) - aka blacklist [domain],[domain],...')
	.describe('config', 'uses JSON-formatted config file to set parameters')
	.describe('cookie', 'document.cookie formatted string for setting a single cookie (e.g. "bar=foo;domain=url")')
	.describe('cookies-file', 'specifies the file name to store the persistent Cookies')
	.describe('disable-js', 'disable JavaScript on the page that will be loaded').boolean('disable-js')
	.describe('ignore-ssl-errors', 'ignores SSL errors, such as expired or self-signed certificate errors')
	.describe('log', 'log to a given file')
	.describe('modules', 'run selected modules only [moduleOne],[moduleTwo],...')
	.describe('phone', 'force viewport and user agent of a mobile phone')
	.describe('no-externals', 'block requests to 3rd party domains').boolean('no-externals')
	.describe('post-load-delay', 'wait X seconds before generating a report')
	.describe('progress', 'shows page loading progress bar (disables verbose mode)').boolean('progress')
	.describe('proxy', 'specifies the proxy server to use (e.g. --proxy=192.168.1.42:8080)')
	.describe('proxy-auth', 'specifies the authentication information for the proxy (e.g. --proxy-auth=username:password)')
	.describe('proxy-type', 'specifies the type of the proxy server [http|socks5|none]')
	.describe('reporter', 'output format / reporter').default('reporter', 'plain').alias('reporter', 'R').alias('reporter', 'format')
	.describe('runs', 'number of runs to perform')
	.describe('screenshot', 'render fully loaded page to a given file')
	.describe('har', 'save HAR to a given file')
	.describe('silent', 'don\'t write anything to the console').boolean('silent')
	.describe('skip-modules', 'skip selected modules [moduleOne],[moduleTwo],...')
	.describe('tablet', 'force viewport and user agent of a tablet')
	.describe('timeout', 'timeout for phantomas run').default('timeout', 15)
	.describe('user-agent', 'provide a custom user agent')
	.describe('verbose', 'writes debug messages to the console').boolean('verbose').alias('verbose', 'v')
	.describe('viewport', 'phantomJS viewport dimensions [width]x[height [default: 1280x1024]')
	.describe('wait-for-selector', 'wait for an element matching given CSS selector before generating a report')

	// experimental features
	.describe('analyze-css', 'emit in-depth CSS metrics - EXPERIMENTAL').boolean('analyze-css')
	.describe('film-strip', 'register film strip when page is loading - EXPERIMENTAL').boolean('film-strip')
	.describe('film-strip-dir', 'folder path to output film strip (default is ./filmstrip directory) - EXPERIMENTAL');

// parse it
options = program.parse(process.argv);
debug('Command line options: %j', options);

// show version number
if (options.version === true) {
	console.log('phantomas v%s', phantomas.version);
	process.exit(0);
}

// show help
if (options.help === true) {
	program.showHelp();
	process.exit(0);
}

// handle URL passed without --url option (#249)
if (typeof options._[2] === 'string') {
	options.url = options._[2];
}

// --url is mandatory -> show help
if (typeof options.url !== 'string' && typeof options.config === 'undefined') {
	program.showHelp();
	process.exit(255);
}

url = options.url;
runs = parseInt(options.runs) || 1;

delete options.url;
delete options._;
delete options.$0;

// handle --no-foo options
options['no-externals'] = options.externals === false;
delete options.externals;

// handle --progress option
var bar;

if (options.progress === true) {
	options.verbose = false;

	bar = new ProgressBar('[:bar] :percent :etas', {
		total: 100 * runs,
		width: 50
	});
}

// perform a single run
function task(callback) {
	// spawn phantomas process
	var child = phantomas(url, options, function(err, data, results) {
		callback(err === 0 ? null : err, results);
	});

	child.on('progress', function(progress, inc) {
		if (bar) {
			bar.tick(inc);
		}
	});

	// pipe --verbose messages to stderr
	child.stderr.pipe(process.stderr);
}

// @see https://github.com/caolan/async#seriestasks-callback
var series = [];

debug('Preparing %d run(s)...', runs);

for (var r=0; r<runs; r++) {
	series.push(task);
}

async.series(
	series,
	function(err, results) {
		var debug = require('debug')('phantomas:runs'),
			reporter,
			res;

		debug('err: %j', err);
		debug('results: %j', results);

		// this function is called when phantomas is done with all runs
		function doneFn() {
			// pass error code from PhantomJS process
			debug('Exiting with code #%d', err);
			process.exit(err);
		}

		if (results[0] !== false) {
			// process JSON results by reporters
			debug('%d of %d run(s) completed with exit code #%d', results.length, runs, err);

			reporter = require('../core/reporter')(results, options);

			debug('Calling a reporter...');

			// pass a function that reporter should call once done
			res = reporter.render(doneFn);

			// reporter returned results, otherwise wait for doneFn to be called by reporter
			if (typeof res !== 'undefined') {
				process.stdout.write(res);
				doneFn();
			}
			else {
				debug('Waiting for the results...');
			}
		}
		else {
			doneFn();
		}
	}
);
