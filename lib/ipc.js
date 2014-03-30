/**
 * Simple IPC implementation using JSON-encoded messages sent over stderr stream
 *
 * Implements consumer of the data (for nodejs environment)
 */
'use strict';

var debug = require('debug')('phantomas:ipc'),
	emitter = require('events').EventEmitter;

function ipc(stream) {
	/* jshint validthis: true */
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

			msg = JSON.parse(msg);
			debug('%s: %j', msg.event, msg.data);

			// send event name and the rest of the data
			var args = msg.data;
			args.unshift(msg.event);

			self.events.emit.apply(self.events, args);
		});
	});
};

ipc.prototype.on = function(event, fn) {
	this.events.on(event, fn);
};

module.exports = ipc;
