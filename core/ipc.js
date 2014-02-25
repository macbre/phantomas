/**
 * Simple IPC implementation using JSON-encoded messages sent over stderr stream
 */
var stderr = require('system').stderr;

function ipc(type) {
	this.type = type;
}

ipc.prototype.push = function(data) {
	stderr.writeLine(JSON.stringify({
		event: this.type,
		data: data
	}));
};

module.exports = ipc;
