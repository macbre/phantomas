/**
 * Support for cookies
 */
/* global phantom: true */
'use strict';

exports.version = '1.0';

exports.module = function(phantomas) {

	var cookiesJar = phantomas.getParam('cookies', [], 'object');

	// setup cookies handling
	function initCookies() {
		// cookie handling via command line and config.json
		phantom.cookiesEnabled = true;

		// handles multiple cookies from config.json, and used for storing
		// constructed cookies from command line.

		// --cookie='bar=foo;domain=url'
		// for multiple cookies, please use config.json `cookies`.
		var cookieParam = phantomas.getParam('cookie', false, 'string');

		if (cookieParam !== false) {
			// Parse cookie. at minimum, need a key=value pair, and a domain.
			// Domain attr, if unavailble, is created from `phantomas.url` during
			//  addition to phantomjs in injectCookies function
			// Full JS cookie syntax is supported.
			var cookieComponents = cookieParam.split(';'),
				cookie = {};

			for (var i = 0, len = cookieComponents.length; i < len; i++) {
				var frag = cookieComponents[i].split('=');

				// special case: key-value
				if (i === 0) {
					cookie.name = frag[0];
					cookie.value = frag[1];

					// special case: secure
				} else if (frag[0] === 'secure') {
					cookie.secure = true;

					// everything else
				} else {
					cookie[frag[0]] = frag[1];
				}
			}

			// see injectCookies for validation
			cookiesJar.push(cookie);
		}
	}

	// add cookies, if any, providing a domain shim
	function injectCookies() {
		if (cookiesJar && cookiesJar.length > 0) {
			// @see http://nodejs.org/docs/latest/api/url.html
			var parseUrl = phantomas.require('url').parse;

			cookiesJar.forEach(function(cookie) {
				// phantomjs required attrs: *name, *value, *domain
				if (!cookie.name || !cookie.value) {
					throw 'this cookie is missing a name or value property: ' + JSON.stringify(cookie);
				}

				if (!cookie.domain) {
					var parsed = parseUrl(phantomas.url),
						root = (parsed.hostname || '').replace(/^www/, ''); // strip www

					cookie.domain = root;
					phantomas.log('Cookies: domain fallback applied - %s', root);
				}

				if (!phantom.addCookie(cookie)) {
					throw 'PhantomJS could not add cookie: ' + JSON.stringify(cookie);
				}

				phantomas.log('Cookies: set ' + JSON.stringify(cookie));
			});
		}
	}

	initCookies();
	phantomas.on('pageBeforeOpen', injectCookies);
};
