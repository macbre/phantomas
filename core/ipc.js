/**
 * Simple IPC implementation using JSON-encoded messages sent over stderr stream
 *
 * Implements producer of the data (for PhantomJS environment)
 */
'use strict';

var stderr = require('system').stderr;

function ipc(event) {
	/* jshint validthis: true */
	this.event = event;
}

ipc.prototype.push = function() {
	stderr.writeLine(JSON.stringify({
		event: this.event,
		data: Array.prototype.slice.apply(arguments)
	}));
};

module.exports = ipc;
