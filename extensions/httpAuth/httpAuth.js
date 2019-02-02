/**
 * Support for HTTP authentication
 */
'use strict';

module.exports = function(phantomas) {
	var username = phantomas.getParam('auth-user') || '',
		password = phantomas.getParam('auth-pass') || '';

	if (username === '' || password === '') {
		return;
	}

	// https://github.com/GoogleChrome/puppeteer/blob/v1.11.0/docs/api.md#pageauthenticatecredentials
	phantomas.on('init', async (_, page) => {
		await page.authenticate({username, password});

		phantomas.log('Set HTTP authentication: %s (pass: %s)', username, new Array(password.length + 1).join('*'));
	});
};
