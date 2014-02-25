/**
 * Simple IPC implementation using JSON-encoded messages sent over stderr stream
 *
 * Implements producer of the data (for PhantomJS environment)
 */
var stderr = require('system').stderr;

function ipc(event) {
	this.event = event;
}

ipc.prototype.push = function(data) {
	stderr.writeLine(JSON.stringify({
		event: this.event,
		data: data
	}));
};

module.exports = ipc;
