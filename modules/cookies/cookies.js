/**
 * cookies metrics
 */
'use strict';

exports.version = '0.3';

exports.module = function(phantomas) {
	// monitor cookies in HTTP headers
	var Collection = require('../../lib/collection'),
		cookiesDomains = new Collection();

	phantomas.setMetric('cookiesSent'); // @desc length of cookies sent in HTTP requests @unreliable
	phantomas.setMetric('cookiesRecv'); // @desc length of cookies received in HTTP responses
	phantomas.setMetric('domainsWithCookies'); // @desc number of domains with cookies set
	phantomas.setMetric('documentCookiesLength'); // @desc length of document.cookie
	phantomas.setMetric('documentCookiesCount'); //@desc number of cookies in document.cookie

	phantomas.on('send', function(entry, res) {
		res.headers.forEach(function(header) {
			switch (header.name) {
				case 'Cookie':
					phantomas.incrMetric('cookiesSent', header.value.length);
					cookiesDomains.push(entry.domain);

					phantomas.log('Cookie: sent "%s" (for %s)', header.value, entry.domain);
					break;
			}
		});
	});

	phantomas.on('recv', function(entry, res) {
		if (entry.hasCookies) {
			res.headers.forEach(function(header) {
				switch (header.name.toLowerCase()) {
					case 'set-cookie':
						var cookies = (header.value || '').split('\n');

						cookies.forEach(function(cookie) {
							phantomas.incrMetric('cookiesRecv', cookie.length);
							cookiesDomains.push(entry.domain);

							phantomas.log('Cookie: received "%s" (for %s)', cookie, entry.domain);
						});
						break;
				}
			});
		}
	});

	// domain cookies (accessible by the browser)
	phantomas.on('report', function() {
		/* global document: true, window: true */

		// domains with cookies
		cookiesDomains.forEach(function(domain, cnt) {
			phantomas.incrMetric('domainsWithCookies');
			phantomas.addOffender('domainsWithCookies', '%s: %d cookie(s)', domain, cnt);
		});

		phantomas.setMetricEvaluate('documentCookiesLength', function() {
			try {
				return document.cookie.length;
			} catch (ex) {
				window.__phantomas.log('documentCookiesLength: not set because ' + ex + '!');
				return 0;
			}
		});

		phantomas.setMetricEvaluate('documentCookiesCount', function() {
			try {
				window.__phantomas.log('Cookies: document.cookie = "' + document.cookie + '"');
				return document.cookie.split(';').length;
			} catch (ex) {
				window.__phantomas.log('documentCookiesCount: not set because ' + ex + '!');
				return 0;
			}
		});
	});
};
