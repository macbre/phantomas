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
 *    [--modules=moduleOne,moduleTwo]
 *    [--user-agent='Custom user agent']
 */

// parse script arguments
var args = require('system').args,
	params = require('./lib/args').parse(args),
	phantomas = require('./core/phantomas'),
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
