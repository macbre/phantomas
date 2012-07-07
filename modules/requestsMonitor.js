/**
 * Simple HTTP requests monitor
 */

exports.module = function(phantomas) {
	console.log(phantomas);

	phantomas.on('loadFinished', function() {
		console.log(arguments);
	});
};
