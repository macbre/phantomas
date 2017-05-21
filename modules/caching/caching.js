/**
 * Analyzes HTTP caching headers
 *
 * @see https://developers.google.com/speed/docs/best-practices/caching
 */
'use strict';

exports.version = '0.2';

exports.module = function(phantomas) {
	var cacheControlRegExp = /max-age=(\d+)/;

	function getCachingTime(url, headers) {
		// false means "no caching"
		var ttl = false,
			headerName,
			now = new Date(),
			headerDate;

		for (headerName in headers) {
			var value = headers[headerName];

			switch (headerName.toLowerCase()) {
				// parse max-age=...
				//
				// max-age=2592000
				// public, max-age=300, must-revalidate
				case 'cache-control':
					var matches = value.match(cacheControlRegExp);

					if (matches) {
						ttl = parseInt(matches[1], 10);
					}
					break;

					// catch Expires and Pragma headers
				case 'expires':
				case 'pragma':
					// and Varnish specific headers
				case 'x-pass-expires':
				case 'x-pass-cache-control':
					phantomas.incrMetric('oldCachingHeaders'); // @desc number of responses with old, HTTP 1.0 caching headers (Expires and Pragma)
					phantomas.addOffender('oldCachingHeaders', url + ' - ' + headerName + ': ' + value);
					if (ttl === false) {
						headerDate = Date.parse(value);
						if (headerDate) ttl = Math.round((headerDate - now) / 1000);
					}
					break;
			}
		}

		//console.log(JSON.stringify(headers)); console.log("TTL: " + ttl + ' s');

		return ttl;
	}

	phantomas.setMetric('cachingNotSpecified'); // @desc number of responses with no caching header sent (no Cache-Control header)
	phantomas.setMetric('cachingTooShort'); // @desc number of responses with too short (less than a week) caching time
	phantomas.setMetric('cachingDisabled'); // @desc number of responses with caching disabled (max-age=0)

	phantomas.setMetric('oldCachingHeaders');
	phantomas.setMetric('cachingUseImmutable'); // @desc number of responses with a long TTL that can benefit from Cache-Control: immutable

	phantomas.on('recv', function(entry, res) {
		var ttl = getCachingTime(entry.url, entry.headers),
			headerName;

		// static assets
		if (entry.isImage || entry.isJS || entry.isCSS) {
			if (ttl === false) {
				phantomas.incrMetric('cachingNotSpecified');
				phantomas.addOffender('cachingNotSpecified', entry.url);
			} else if (ttl <= 0) {
				phantomas.incrMetric('cachingDisabled');
				phantomas.addOffender('cachingDisabled', entry.url);
			} else if (ttl < 7 * 86400) {
				phantomas.incrMetric('cachingTooShort');
				phantomas.addOffender('cachingTooShort', entry.url + ' cached for ' + ttl + ' s');
			} else {
				// long TTL, suggest the use of Cache-Control: immutable (issue #683)
				for (headerName in entry.headers) {
					var value = entry.headers[headerName];

					if (headerName.toLowerCase() === 'cache-control') {
						if (/,\s?immutable/.test(value) === false) {
							phantomas.incrMetric('cachingUseImmutable');
							phantomas.addOffender('cachingUseImmutable', entry.url + ' cached for ' + ttl + ' s');
						} else {
							phantomas.log('caching: Cache-Control: immutable used for <%s>', entry.url);
						}
					}
				}
			}
		}
	});
};
