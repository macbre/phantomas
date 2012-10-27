/**
 * PhantomJS-based web performance metrics collector
 *
 * Usage:
 *  phantomjs phantomas.js
 *    --url=<page to check>
 *    --verbose
 *
 * @version 0.2
 */

// parse script arguments
var args = require('system').args,
	params = require('./lib/args').parse(args),
	phantomas = require('./core/phantomas').phantomas,
	instance;

// run phantomas
instance = new phantomas(params);

// add 3rd party modules
instance.listModules().forEach(function(moduleName) {
	instance.addModule(moduleName);
});

// and finally - run it!
try {
	instance.run();
} 
catch(ex) {
	console.log('phantomas v' + phantomas.version + ' failed with an error:');
	console.log(ex);

	phantom.exit(1);
}
