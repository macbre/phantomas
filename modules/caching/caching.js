/**
 * Analyzes HTTP caching headers
 *
 * @see https://developers.google.com/speed/docs/best-practices/caching
 */
exports.version = '0.2';

exports.module = function(phantomas) {
	var cacheControlRegExp = /max-age=(\d+)/;

	function getCachingTime(url, headers) {
		// false means "no caching"
		var ttl = false,
			headerName;

		for (headerName in headers) {
			var value = headers[headerName];

			switch(headerName.toLowerCase()) {
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
					phantomas.incrMetric('oldCachingHeaders');
					phantomas.addOffender('oldCachingHeaders', url + ' - ' + headerName + ': ' + value);
					break;
			}
		}

		//console.log(JSON.stringify(headers)); console.log("TTL: " + ttl + ' s');

		return ttl;
	}

	phantomas.setMetric('cachingNotSpecified');
	phantomas.setMetric('cachingTooShort');
	phantomas.setMetric('cachingDisabled');

	phantomas.setMetric('oldCachingHeaders');
	
	phantomas.on('recv', function(entry, res) {
		var ttl = getCachingTime(entry.url, entry.headers);

		// static assets
		if (entry.isImage || entry.isJS || entry.isCSS) {
			if (ttl === false) {
				phantomas.incrMetric('cachingNotSpecified');
				phantomas.addOffender('cachingNotSpecified', entry.url);
			}
			else if (ttl === 0) {
				phantomas.incrMetric('cachingDisabled');
				phantomas.addOffender('cachingDisabled', entry.url);
			}
			else if (ttl < 7 * 86400) {
				phantomas.incrMetric('cachingTooShort');
				phantomas.addOffender('cachingTooShort', entry.url + ' cached for ' + ttl + ' s');
			}
		}
	});
};
