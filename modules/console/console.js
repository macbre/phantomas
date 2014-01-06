/**
 * Releases notices of console logs, and meters number of console logs.
 */
exports.version = '0.2';

exports.module = function(phantomas) {
	phantomas.setMetric('consoleMessages');

	phantomas.on('consoleLog', function(msg) {
		phantomas.incrMetric('consoleMessages');
	});
};
