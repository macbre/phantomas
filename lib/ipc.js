/**
 * Simple IPC implementation using JSON-encoded messages sent over stderr stream
 *
 * Implements consumer of the data (for nodejs environment)
 */
var debug = require('debug')('phantomas:ipc'),
	emitter = require('events').EventEmitter;

function ipc(stream) {
	this.stream = stream;
	this.events = new emitter();

	this.init();
}

ipc.prototype.init = function() {
	var self = this;

	this.stream.on('data', function(data) {
		// split multiple messages
		var messages = data.toString().trim().split("\n");

		messages.forEach(function(msg) {
			if (msg === '') return;

			debug('%s', msg);
			msg = JSON.parse(msg);

			self.events.emit(msg.event, msg.data);
		});
	});
};

ipc.prototype.on = function(event, fn) {
	this.events.on(event, fn);
};

module.exports = ipc;
