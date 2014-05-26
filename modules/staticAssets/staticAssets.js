/**
 * Analyzes static assets (CSS, JS and images)
 */
'use strict';

exports.version = '0.4';

exports.module = function(phantomas) {
	var BASE64_SIZE_THRESHOLD = 2 * 1024;

	// count requests for each asset
	var Collection = require('../../lib/collection'),
		assetsReqCounter = new Collection(),
		cookieDomains = new Collection(),
		// TODO: use 3pc database with tracking services
		trackingUrls = /google-analytics.com\/__utm.gif|pixel.quantserve.com\/pixel/;

	phantomas.setMetric('assetsNotGzipped'); // @desc number of static assets that were not gzipped @unreliable
	phantomas.setMetric('assetsWithQueryString'); // @desc number of static assets requested with query string (e.g. ?foo) in URL
	phantomas.setMetric('assetsWithCookies'); // @desc number of static assets requested from domains with cookie set
	phantomas.setMetric('smallImages'); // @desc number of images smaller than 2 kB that can be base64 encoded @unreliable
	phantomas.setMetric('multipleRequests'); // @desc number of static assets that are requested more than once

	phantomas.on('recv', function(entry, res) {
		// mark domains with cookie set
		if (entry.hasCookies) {
			cookieDomains.push(entry.domain);
		}

		//phantomas.log('entry: %j', entry);
		var isContent = entry.status === 200;

		// skip tracking requests
		if (trackingUrls.test(entry.url)) {
			return;
		}

		// check for query string -> foo.css?123
		if (entry.isImage || entry.isJS || entry.isCSS) {
			if (entry.url.indexOf('?') > -1) {
				phantomas.incrMetric('assetsWithQueryString');
				phantomas.addOffender('assetsWithQueryString', entry.url + ' (' + entry.type.toUpperCase() + ')');
			}
		}

		// check for not-gzipped CSS / JS / HTML files
		if (entry.isJS || entry.isCSS || entry.isHTML) {
			if (!entry.gzip && isContent) {
				phantomas.incrMetric('assetsNotGzipped');
				phantomas.addOffender('assetsNotGzipped', entry.url + ' (' + entry.type.toUpperCase() + ')');
			}
		}

		// check small images that can be base64 encoded
		if (entry.isImage) {
			if (entry.contentLength < BASE64_SIZE_THRESHOLD) {
				phantomas.incrMetric('smallImages');
				phantomas.addOffender('smallImages', entry.url + ' (' + (entry.contentLength/1024).toFixed(2) + ' kB)');
			}
		}

		if (entry.isImage || entry.isJS || entry.isCSS) {
			// count number of requests to each asset
			assetsReqCounter.push(entry.url);

			// count static assets requested from domains with cookie set
			if (cookieDomains.has(entry.domain)) {
				phantomas.incrMetric('assetsWithCookies');
				phantomas.addOffender('assetsWithCookies', '%s (%s)', entry.url, entry.type.toUpperCase());
			}
		}
	});

	phantomas.on('report', function() {
		assetsReqCounter.forEach(function(asset, cnt) {
			if (cnt > 1) {
				phantomas.incrMetric('multipleRequests');
				phantomas.addOffender('multipleRequests', asset);
			}
		});
	});
};
