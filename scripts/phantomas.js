/**
 * phantomas script executed by PhantomJS
 *
 * Don't run it directly. Use phantomas.js nodejs script instead!
 */
var system = require('system'),
	phantomas = require('../core/phantomas'),
	instance,
	options;

// compatibility with SlimerJS
if (typeof slimer !== 'undefined') {
	// @see http://docs.slimerjs.org/current/api/require.html#require-paths
	require.paths.push('../node_modules/ansicolors');
	require.paths.push('../node_modules/ansistyles');
}

// read options from script arguments
options = system.args[1];

try {
	// run phantomas
	instance = new phantomas(JSON.parse(options));
	instance.run();
} catch (ex) {
	console.log('phantomas v' + phantomas.version + ' failed with an error:');
	console.log(ex);

	phantom.exit(255);
}
