/**
 * PhantomJS-based web performance metrics collector
 *
 * Usage:
 *  node phantomas.js
 *    --url=<page to check>
 *    --verbose
 *
 *
 * @version 0.1
 */

var nodify = 'lib/phantomjs-nodify/nodify.js';
phantom.injectJs(nodify);

nodify.run(function() {
	// ...
	console.log('Kaboom!');
	phantom.exit();
});
