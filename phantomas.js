/**
 * PhantomJS-based web performance metrics collector
 *
 * Usage:
 *  node phantomas.js
 *    --url=<page to check>
 *    --verbose
 *
 * @version 0.1
 */

// @see https://github.com/jgonera/phantomjs-nodify#how-to-use
var nodify = 'lib/phantomjs-nodify/nodify.js';
phantom.injectJs(nodify);

nodify.run(function() {
	// parse script arguments
	var args = require('./lib/args').parse(phantom.args);

	console.log(args);
	phantom.exit();
});
