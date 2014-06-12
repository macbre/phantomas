/**
 * Simple IPC implementation using JSON-encoded messages sent over stdout stream
 *
 * Implements producer of the data (for PhantomJS environment)
 */
'use strict';

var stream = require('system').stdout,
	SEPARATOR = "\xFF\xFF";

function ipc(event) {
	/* jshint validthis: true */
	this.event = event;
}

ipc.prototype.push = function() {
	stream.writeLine(JSON.stringify({
		event: this.event,
		data: Array.prototype.slice.apply(arguments)
	}));
	stream.writeLine(SEPARATOR);
};

module.exports = ipc;
