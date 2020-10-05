/**
 * Delays report generation until given CSS selector can be resolved (i.e. given element exists)
 */
/* global document: true */
'use strict';

module.exports = function(phantomas) {
	// e.g. --wait-for-selector "body.loaded"
	var selector = phantomas.getParam('wait-for-selector');

	if (typeof selector !== 'string') {
		return;
	}

	// https://github.com/GoogleChrome/puppeteer/blob/v1.11.0/docs/api.md#framewaitforselectororfunctionortimeout-options-args
	phantomas.log('Will wait for "%s" selector', selector);

	phantomas.on('beforeClose', page => {
		phantomas.log('Waiting for "%s"...', selector);

		return page.waitForSelector(selector);
	});
};
