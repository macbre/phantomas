/**
 * phantomas script executed by PhantomJS
 *
 * Don't run it directly. Use phantomas.js nodejs script instead!
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
