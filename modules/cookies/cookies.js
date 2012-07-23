/**
 * cookies metrics
 */
exports.version = '0.1';

exports.module = function(phantomas) {
	// monitor cookies in HTTP headers
	var cookiesSent = 0,
		cookiesRecv = 0;
		cookiesDomains = {};

	phantomas.on('send', function(entry, res) {
		res.headers.forEach(function(header) {
			switch (header.name) {
				case 'Cookie':
					cookiesSent += header.value.length;
					cookiesDomains[entry.domain] = true;
					break;
			}
		});
	});

	phantomas.on('recv', function(entry, res) {
		res.headers.forEach(function(header) {
			switch (header.name) {
				case 'Set-Cookie':
					cookiesRecv += header.value.length;
					cookiesDomains[entry.domain] = true;
					break;
			}
		});
	});

	// domain cookies (accessible by the browser)
	phantomas.on('report', function() {
		phantomas.setMetric('cookiesSent', cookiesSent);
		phantomas.setMetric('cookiesRecv', cookiesRecv);

		// domains with cookies
		var domainsWithCookies = 0;
		for (var domain in cookiesDomains) {
			domainsWithCookies++;
		}
		phantomas.setMetric('domainsWithCookies', domainsWithCookies);

		phantomas.setMetricEvaluate('documentCookiesLength', function() {
			return document.cookie.length;
		});

		phantomas.setMetricEvaluate('documentCookiesCount', function() {
			return document.cookie.split(';').length;
		});
	});
};
