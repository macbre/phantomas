#!/usr/bin/env phantomjs
/**
 * PhantomJS-based web performance metrics collector
 *
 * Usage:
 *  phantomjs phantomas.js
 *    --url=<page to check>
 *    [--timeout=5]
 *    [--format=json|csv|plain]
 *    [--verbose]
 *    [--silent]
 *    [--modules=moduleOne,moduleTwo]
 *    [--user-agent='Custom user agent']
 *
 * @version 0.3
 */

// parse script arguments
var args = require('system').args,
	params = require('./lib/args').parse(args),
	phantomas = require('./core/phantomas').phantomas,
	instance;

// run phantomas
instance = new phantomas(params);

try {
	instance.run(function() {
		phantom.exit(0);
	});
}
catch(ex) {
	console.log('phantomas v' + phantomas.version + ' failed with an error:');
	console.log(ex);

	phantom.exit(1);
}
