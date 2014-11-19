/**
 * A simple wrapper for ansicolors npm module
 *
 * Makes it noop when the stdout is not a TTY
 */
'use strict';

var colors = require('ansicolors'),
	keys = Object.keys(colors),
	disableColors;

if (typeof process !== 'undefined' && typeof process.stdout !== 'undefined') {
	// nodejs
	disableColors = !!process.env.BW;
} else {
	// PhantomJS
	disableColors = !!(require('system').env.BW);
}

function nop(str) {
	return str;
}

function disable() {
	keys.forEach(function(key) {
		colors[key] = nop;
	});
}

if (disableColors) {
	disable();
}

// expose disable() function
colors.disable = disable;

module.exports = colors;
