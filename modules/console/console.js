/**
 * Meters number of console logs
 */
'use strict';

exports.version = '0.2';

exports.module = function(phantomas) {
	phantomas.setMetric('consoleMessages'); // @desc number of calls to console.* functions

	phantomas.on('consoleLog', function(msg) {
		phantomas.incrMetric('consoleMessages');
	});
};
