/**
 * Simple logger (using both file and console)
 */
module.exports = function(logFile, params) {
	var colors = require('ansicolors'),
		fs = require('fs'),
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
		msg = (typeof msg === 'object') ? JSON.stringify(msg) : msg;

		// log to the console (--verbose)
		if (beVerbose) {
			echo(ts + ' ' + colors.brightBlack(msg));
		}

		// log to the file (--log)
		if (stream) {
			stream.writeLine(ts + ': ' + msg);
			stream.flush();
		}
	}

	// public interface
	this.echo = echo;
	this.log = log;
};
