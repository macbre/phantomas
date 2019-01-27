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

	phantomas.on('init', (_, page) => {
		// https://github.com/GoogleChrome/puppeteer/blob/v1.11.0/docs/api.md#framewaitforselectororfunctionortimeout-options-args
		phantomas.log('Selector: will wait for "%s" selector', selector);

		phantomas.awaitBeforeClose(function waitForSelector() {
			phantomas.log('Waiting for "%s"...', selector);

			return page.waitFor(selector => !!document.querySelector(selector), {}, selector);
		});
	});
};
