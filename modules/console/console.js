/**
 * Meters number of console logs
 */
'use strict';

module.exports = (phantomas) => {
	phantomas.setMetric('consoleMessages'); // @desc number of calls to console.* functions @offenders

	phantomas.on('consoleLog', (msg) => {
		phantomas.incrMetric('consoleMessages');

		// https://github.com/GoogleChrome/puppeteer/blob/v1.11.0/docs/api.md#consolemessagetext
		phantomas.addOffender('consoleMessages', msg.text());
	});
};
