/**
 * Meters number of console logs
 */
'use strict';

module.exports = function(phantomas) {
	phantomas.setMetric('consoleMessages'); // @desc number of calls to console.* functions

	phantomas.on('consoleLog', (msg) => {
		phantomas.incrMetric('consoleMessages');
	});
};
