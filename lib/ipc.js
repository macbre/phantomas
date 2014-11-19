/**
 * Simple IPC implementation using JSON-encoded messages sent over stdout stream
 *
 * Implements consumer of the data (for nodejs environment)
 */
'use strict';

var debug = require('debug')('phantomas:ipc'),
	emitter = require('events').EventEmitter,
	SEPARATOR = "\xFF\xFF";

function ipc(stream) {
	/* jshint validthis: true */
	this.stream = stream;
	this.events = new emitter();

	this.init();
}

ipc.prototype.setEventEmitter = function(emitter) {
	this.events = emitter;
};

ipc.prototype.init = function() {
	var self = this,
		buffer = '';

	this.stream.on('data', function(data) {
		buffer += data.toString().trim();

		// check for the separator at the of the buffer - parse the data
		if (buffer.substr(-2) === SEPARATOR) {
			self.parse(buffer);
			buffer = '';
		}
	});
};

ipc.prototype.parse = function(data) {
	// split by separator
	data.split(SEPARATOR).forEach(function(msg) {
		msg = msg.trim();

		if (msg === '') return;

		try {
			msg = JSON.parse(msg);
			debug('%s: %j', msg.event, msg.data);

			// send event name and the rest of the data
			var args = msg.data;
			args.unshift(msg.event);

			this.events.emit.apply(this.events, args);

			// send generic "_msg" event for each message received (issue #354)
			this.events.emit('_msg', args);
		} catch (e) {
			// send PhantomJS errors to stderr to ease debugging of issues like #302
			debug('message parsing failed: "%s"', msg);
			process.stderr.write(msg + "\n");
		}
	}, this);
};

ipc.prototype.on = function(event, fn) {
	this.events.on(event, fn);
};

module.exports = ipc;
