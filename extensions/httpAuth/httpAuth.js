/**
 * Support for HTTP authentication
 */
'use strict';

exports.version = '1.0';

exports.module = function(phantomas) {
	var userName = phantomas.getParam('auth-user', '', 'string'),
		password = phantomas.getParam('auth-pass', '', 'string');

	if (userName === '' || password === '') {
		return;
	}

	phantomas.on('pageBeforeOpen', function(page) {
		phantomas.log('Using HTTP auth: %s (pass: %s)', userName, new Array(password.length + 1).join('*'));

		page.settings.userName = userName;
		page.settings.password = password;
	});
};
