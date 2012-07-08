/**
 * PhantomJS-based web performance metrics collector
 *
 * Usage:
 *  node phantomas.js
 *    --url=<page to check>
 *    --debug
 *    --verbose
 *
 * @version 0.1
 */

// @see https://github.com/jgonera/phantomjs-nodify#how-to-use
var nodify = 'lib/phantomjs-nodify/nodify.js';
phantom.injectJs(nodify);

nodify.run(function() {
	// parse script arguments
	var params = require('./lib/args').parse(phantom.args),
		phantomas = require('./core/phantomas.js').phantomas;

	// run phantomas
	var instance = new phantomas(params);

	// add modules
	instance.addModule('requestsMonitor');
	instance.addModule('domComplexity');

	// and finally - run it!
	instance.run();
});
