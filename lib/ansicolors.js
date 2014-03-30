/**
 * A simple wrapper for ansicolors npm module
 *
 * Makes it noop when the stdout is not a TTY
 */
'use strict';

var colors = require('ansicolors'),
	disableColors;

if (typeof process.stdout !== 'undefined') {
	// nodejs
	disableColors = !process.stdout.isTTY;
}
else {
	// PhantomJS
	disableColors = !!(require('system').env.BW);
}

function nop(str) {
	return str;
}

if (disableColors) {
	Object.keys(colors).forEach(function(key) {
		colors[key] = nop;
	});
}

module.exports = colors;
