/**
 * Analyzes HTTP caching headers
 *
 * @see https://developers.google.com/speed/docs/best-practices/caching
 */
exports.version = '0.1';

exports.module = function(phantomas) {
	var cacheControlRegExp = /max-age=(\d+)/;

	function getCachingTime(headers) {
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

				// TODO: parse date
				case 'expires':
					break;
			}
		}

		//console.log(JSON.stringify(headers)); console.log("TTL: " + ttl + ' s');

		return ttl;
	}

	phantomas.setMetric('cachingNotSpecified');
	phantomas.setMetric('cachingTooShort');
	phantomas.setMetric('cachingDisabled');
	
	phantomas.on('recv', function(entry, res) {
		var ttl = getCachingTime(entry.headers);

		// static assets
		if (entry.isImage || entry.isJS || entry.isCSS) {
			if (ttl === false) {
				phantomas.log("Caching: no caching specified for <" + entry.url + ">");
				phantomas.incrMetric('cachingNotSpecified');
			}
			else if (ttl === 0) {
				phantomas.log("Caching: disabled for <" + entry.url + ">");
				phantomas.incrMetric('cachingDisabled');
			}
			else if (ttl < 7 * 86400) {
				phantomas.log("Caching: caching period is less than a week for <" + entry.url + "> (set to " + ttl + " s)");
				phantomas.incrMetric('cachingTooShort');
			}
		}
	});
};
