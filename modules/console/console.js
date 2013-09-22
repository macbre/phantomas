/**
 * Releases notices of console logs, and meters number of console logs.
 */

exports.version = '0.1';

exports.module = function(phantomas) {
	var cmsgs = [];

	phantomas.on('consoleLog', function(msg) {
		cmsgs.push(msg);
	});

	phantomas.on('report', function() {
		phantomas.setMetric('consoleMessages', cmsgs.length);
	});
};
