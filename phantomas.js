#!/usr/bin/env node
var phantomas = require('./index'),
	program = require('optimist'),
	child,
	options = {},
	program,
	url = '';

// parse options
program
	.usage('phantomas --url <url> [options]')

	// mandatory
	.describe('url', 'Set URL to work with').string('url')

	// version / help
	.describe('version', 'Show version number and quit').boolean('version').alias('version', 'V')
	.describe('help', 'This help text').boolean('help').alias('help', 'h')

	// optional params
	.describe('allow-domain', 'allow requests to given domain(s) - aka whitelist [domain],[domain],...')
	.describe('block-domain', 'disallow requests to given domain(s) - aka blacklist [domain],[domain],...')
	.describe('config', 'uses JSON-formatted config file to set parameters')
	.describe('cookie', 'document.cookie formatted string for setting a single cookie (e.g. "bar=foo;domain=url")')
	.describe('cookie-jar', 'persistent cookie JAR across requests')
	.describe('disable-js', 'disable JavaScript on the page that will be loaded').boolean('disable-js')
	.describe('format', 'output format').default('format', 'plain')
	.describe('log', 'log to a given file')
	.describe('modules', 'run selected modules only [moduleOne],[moduleTwo],...')
	.describe('no-externals', 'block requests to 3rd party domains').boolean('no-externals')
	.describe('screenshot', 'render fully loaded page to a given file')
	.describe('silent', 'don\'t write anything to the console').boolean('silent')
	.describe('skip-modules', 'skip selected modules [moduleOne],[moduleTwo],...')
	.describe('timeout', 'timeout for phantomas run').default('timeout', 15)
	.describe('user-agent', 'provide a custom user agent')
	.describe('verbose', 'writes debug messages to the console').boolean('verbose').alias('verbose', 'v')
	.describe('viewport', 'phantomJS viewport dimensions [width]x[height]').default('viewport', '1280x1024')

	// experimental features
	.describe('analyze-css', 'emit in-depth CSS metrics - EXPERIMENTAL').boolean('analyze-css')
	.describe('film-strip', 'register film strip when page is loading (PNG files will be saved in ./filmstrip directory) - EXPERIMENTAL').boolean('film-strip');

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

// spawn phantomas process
child = phantomas(url, options);

// emit --verbose messages
child.stderr.pipe(process.stderr);

// pass raw results
child.on('results', function (res) {
	process.stdout.write(res);
});

// pass exit code
child.on('error', function (code) {
	process.exit(code);
});
