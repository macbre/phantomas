#!/usr/bin/env node

/**
 * Headless Chromium-based web performance metrics collector and monitoring tool
 *
 * Run "node phantomas.js" to get help
 *
 * @see https://github.com/macbre/phantomas
 */
'use strict';

var phantomas = require('..'),
	async = require('async'),
	debug = require('debug')('phantomas:cli'),
	program = require('optimist-config-file'),
	options = {},
	runs,
	url = '';

// parse options
program
	.usage('Headless Chromium-based web performance metrics collector and monitoring tool\n\nphantomas <url> [options]')
	// mandatory
	.header('General options')
	.describe('url', 'Set URL to work with').string('url')
	// version / help
	.describe('version', 'Show version number and quit').boolean('version').alias('version', 'V')
	.describe('help', 'This help text').boolean('help').alias('help', 'h')
	.describe('verbose', 'print debug messages to the console').boolean('verbose').alias('verbose', 'v')
	.describe('debug', 'run phantomas in debug mode').default('debug')
	.describe('modules', 'run selected modules only [moduleOne],[moduleTwo],...')
	.describe('include-dirs', 'load modules from specified directories [dirOne],[dirTwo],...')
	.describe('skip-modules', 'skip selected modules [moduleOne],[moduleTwo],...')
	.describe('config', 'uses JSON or YAML-formatted config file to set parameters').string('config')
	// optional params
	.header('Client options')
	// --engine=[webkit|gecko]
	.describe('engine', '[experimental] select engine used to run the phantomas [webkit|gecko]').string('engine')
	.describe('phone', 'force viewport and user agent of a mobile phone')
	.describe('tablet', 'force viewport and user agent of a tablet')
	.describe('viewport', 'viewport dimensions [width]x[height [default: 1280x1024]')
	.describe('user-agent', 'provide a custom user agent')
	.header('HTTP options')
	.describe('auth-user', 'sets the user name used for HTTP authentication')
	.describe('auth-pass', 'sets the password used for HTTP authentication')
	.describe('cookie', 'document.cookie formatted string for setting a single cookie (e.g. "bar=foo;domain=url")')
	.describe('cookies-file', 'specifies the file name to store the persistent Cookies')
	.describe('ignore-ssl-errors', 'ignores SSL errors, such as expired or self-signed certificate errors')
	.describe('proxy', 'specifies the proxy server to use (e.g. --proxy=192.168.1.42:8080)')
	.describe('proxy-auth', 'specifies the authentication information for the proxy (e.g. --proxy-auth=username:password)')
	.describe('proxy-type', 'specifies the type of the proxy server [http|socks5|none]')
	.describe('ssl-protocol', 'sets the SSL protocol for secure connections [sslv3|sslv2|tlsv1|any]').default('ssl-protocol', 'any')
	.header('Runtime options')
	.describe('allow-domain', 'allow requests to given domain(s) - aka whitelist [domain],[domain],...')
	.describe('block-domain', 'disallow requests to given domain(s) - aka blacklist [domain],[domain],...')
	.describe('disable-js', 'disable JavaScript on the page that will be loaded').boolean('disable-js')
	.describe('no-externals', 'block requests to 3rd party domains').boolean('no-externals')
	.describe('post-load-delay', 'wait X seconds before generating a report')
	.describe('scroll', 'scroll down the page when it\'s loaded').boolean('scroll')
	.describe('spy-eval', 'report calls to eval()').boolean('spy-eval')
	.describe('stop-at-onload', 'stop phantomas immediately after onload event').boolean('stop-at-onload')
	.describe('timeout', 'timeout for phantomas run').default('timeout', 15)
	.describe('wait-for-event', 'wait for a given phantomas event before generating a report')
	.describe('wait-for-selector', 'wait for an element matching given CSS selector before generating a report')
	.describe('scroll', 'scroll down the page when it\'s loaded').boolean('scroll')
	.describe('socket', '[experimental] use provided UNIX socket for IPC')
	.header('Output and reporting')
	.describe('analyze-css', '[experimental] emit in-depth CSS metrics').boolean('analyze-css')
	.describe('colors', 'forces ANSI colors even when output is piped').boolean('colors')
	.describe('film-strip', 'register film strip when page is loading (a comma separated list of milliseconds can be passed)').boolean('film-strip')
	.describe('film-strip-dir', 'folder path to output film strip (default is ./filmstrip directory)')
	.describe('har', 'save HAR to a given file')
	.describe('log', 'log to a given file')
	.describe('page-source', '[experimental] save page source to file').boolean('page-source')
	.describe('page-source-dir', '[experimental] folder path to output page source (default is ./html directory)')
	.describe('reporter', 'output format / reporter').default('reporter', 'plain').alias('reporter', 'R').alias('reporter', 'format')
	.describe('screenshot', 'render fully loaded page to a given file')
	.describe('silent', 'don\'t write anything to the console').boolean('silent');

// handle --config (issue #209)
program.setConfigFile('config');

// handle env variables (issue #685)
program.setReplacementVars(process.env);

// parse it
options = program.parse(process.argv);

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

delete options.url;
delete options._;
delete options.$0;

// handle --no-foo options
options['no-externals'] = options.externals === false;
delete options.externals;

// add env variable to turn off ANSI colors when needed (#237)
// suppress this behaviour by passing --colors option (issue #342)
if (!process.stdout.isTTY && (options.colors !== true)) {
	debug('ANSI colors turned off');
	process.env.BW = 1;
}

// spawn phantomas process
const promise = phantomas(url, options).
	catch(err => {
		debug('Error: %s', err);
		process.exit(1);
	}).
	then(async results => {
		debug('Calling a reporter...');
		debug('Metrics: %j', results.getMetrics());

		const reporter = require('../reporters/json')(results, options);
		const res = await reporter.render();

		const needDrain = !process.stdout.write(res);

		// If a stream.write(chunk) call returns false, then the 'drain' event will indicate when it is appropriate to begin writing more data to the stream.
		// @see #596
		if (needDrain) {
			debug('Need to wait for stdout to be fully flushed...');
			// process.stdout.on('drain');
		}
	}
);
