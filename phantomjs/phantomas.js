#!/usr/bin/env phantomjs
/**
 * PhantomJS-based web performance metrics collector
 *
 * @see https://github.com/macbre/phantomas
 *
 * Usage:
 *  ./phantomas.js
 *    --url=<page to check>
 *    [--format=json|csv|tap|plain]
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
 *    [--cookie-jar='cookies JAR file']
 *    [--no-externals]
 *    [--allow-domain='domain,domain']
 *    [--block-domain='domain,domain']
 *    [--disable-js]
 *    [--analyze-css]
 *    [--film-strip]
 *    [--screenshot='file name']
 */
var args = require('system').args,
        // parse script arguments
        params = require('../lib/args').parse(args),
        phantomas = require('../core/phantomas'),
        instance;

// compatibility layer for NodeJS modules
process = {argv: []};

// run phantomas
instance = new phantomas(params);

try {
	instance.run();
}
catch(ex) {
	console.log('phantomas v' + phantomas.version + ' failed with an error:');
	console.log(ex);

	phantom.exit(255);
}
