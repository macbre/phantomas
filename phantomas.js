#!/usr/bin/env phantomjs
/**
 * PhantomJS-based web performance metrics collector
 *
 * Usage:
 *  ./phantomas.js
 *    --url=<page to check>
 *    [--format=json|csv|plain]
 *    [--timeout=5]
 *    ]--viewport=<width>x<height>]
 *    [--verbose]
 *    [--silent]
 *    [--log=<log file>]
 *    [--modules=moduleOne,moduleTwo]
 *    [--skip-modules=moduleOne,moduleTwo]
 *    [--user-agent='Custom user agent']
 *    [--config='JSON config file']
 *    [--cookie='bar=foo;domain=url']
 *    [--no-externals]
 *    [--allow-domain='domain,domain']
 *    [--block-domain='domain,domain']
 *    [--analyze-css]
 *    [--film-strip]
 */
var args = require('system').args,
	// get absolute path (useful when phantomas is installed globally)
	dir = require('fs').readLink(args[0]).replace(/phantomas.js$/, '') || '.',
	// parse script arguments
	params = require(dir + '/lib/args').parse(args),
	phantomas = require(dir + '/core/phantomas'),
	instance;

// run phantomas
instance = new phantomas(params);

try {
	instance.run();
}
catch(ex) {
	console.log('phantomas v' + phantomas.version + ' failed with an error:');
	console.log(ex);

	phantom.exit(1);
}
