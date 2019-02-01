/**
 * Delays report generation until given phantomas event is emitted (issue #453)
 */
'use strict';

module.exports = function(phantomas) {
	// e.g. --wait-for-event "done"
	var eventName = phantomas.getParam('wait-for-event');

	if (typeof eventName !== 'string') {
		return;
	}

	// https://github.com/GoogleChrome/puppeteer/blob/v1.11.0/docs/api.md#framewaitforfunctionpagefunction-options-args
	phantomas.log('Will wait for a "%s" event', eventName);

	phantomas.on('beforeClose', () => {
		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
		return new Promise(resolve => {
			phantomas.log('Waiting for "%s" event...', eventName);
			phantomas.on(eventName, resolve);
		});
	});
};
