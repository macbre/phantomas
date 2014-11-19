/**
 * Simple logger (using both file and console)
 */
'use strict';

module.exports = function(logFile, params) {
	var colors = require('../lib/ansicolors'),
		styles = require('ansistyles'),
		fs = require('fs'),
		ipc = new(require('./ipc'))('log'),
		beVerbose = params.beVerbose === true,
		beSilent = params.beSilent === true,
		stream;

	if (logFile !== '') {
		// use an absolute path
		logFile = fs.absolute(logFile);
		log("Logging to " + logFile);

		// set up a stream to be used for logging
		stream = fs.open(logFile, 'w');
	}

	function echo(msg) {
		if (!beSilent) {
			console.log(msg);
		}
	}

	function log(msg) {
		var ts = (new Date()).toJSON().substr(11, 12);

		// format a message
		msg = (typeof msg === 'object') ? JSON.stringify(msg) : msg.toString().trim();

		// log to the console (--verbose)
		if (beVerbose) {
			var consoleMsg = msg;

			// error!
			if (/!$/.test(consoleMsg) || /Error:/.test(consoleMsg)) {
				consoleMsg = colors.brightRed(styles.bright(consoleMsg));
			}
			// label: message
			else if (/^(.*): /.test(consoleMsg)) {
				var idx = consoleMsg.indexOf(': ') + 1;
				consoleMsg = colors.brightGreen(consoleMsg.substr(0, idx)) + colors.brightBlack(consoleMsg.substr(idx));
			}
			// the rest
			else {
				consoleMsg = colors.brightBlack(consoleMsg);
			}

			if (!beSilent) {
				ipc.push(ts + ' ' + consoleMsg);
			}
		}

		// log to the file (--log)
		if (stream) {
			stream.writeLine(ts + ': ' + msg);
			stream.flush();
		}
	}

	// public API
	return {
		echo: echo,
		log: log
	};
};
