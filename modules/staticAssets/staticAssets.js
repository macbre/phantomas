/**
 * Analyzes static assets (CSS, JS and images)
 */
'use strict';

exports.version = '0.5';

exports.module = function(phantomas) {
	var SIZE_THRESHOLD = 2 * 1024;

	// count requests for each asset
	var Collection = require('../../lib/collection'),
		assetsReqCounter = new Collection(),
		cookieDomains = new Collection(),
		// TODO: use 3pc database with tracking services
		trackingUrls = /google-analytics.com\/__utm.gif|pixel.quantserve.com\/pixel/;

	phantomas.setMetric('assetsNotGzipped'); // @desc number of static assets that were not gzipped @unreliable
	phantomas.setMetric('assetsWithQueryString'); // @desc number of static assets requested with query string (e.g. ?foo) in URL
	phantomas.setMetric('assetsWithCookies'); // @desc number of static assets requested from domains with cookie set
	phantomas.setMetric('smallImages'); // @desc number of images smaller than 2 KiB that can be base64 encoded @unreliable
	phantomas.setMetric('smallCssFiles'); // @desc number of CSS assets smaller than 2 KiB that can be inlined or merged @unreliable
	phantomas.setMetric('smallJsFiles'); // @desc number of JS assets smaller than 2 KiB that can be inlined or merged @unreliable
	phantomas.setMetric('multipleRequests'); // @desc number of static assets that are requested more than once

	phantomas.on('recv', function(entry, res) {
		var isContent = (entry.status === 200),
			sizeFormatted;

		// mark domains with cookie set
		if (entry.hasCookies) {
			cookieDomains.push(entry.domain);
		}

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

		// small assets can be inlined
		if (entry.contentLength < SIZE_THRESHOLD) {
			sizeFormatted = (entry.contentLength / 1024).toFixed(2);

			// check small images that can be base64 encoded
			if (entry.isImage) {
				phantomas.incrMetric('smallImages');
				phantomas.addOffender('smallImages', '%s (%s kB)', entry.url, sizeFormatted);
			}
			// CSS / JS that can be inlined
			else if (entry.isCSS) {
				phantomas.incrMetric('smallCssFiles');
				phantomas.addOffender('smallCssFiles', '%s (%s kB)', entry.url, sizeFormatted);
			} else if (entry.isJS) {
				phantomas.incrMetric('smallJsFiles');
				phantomas.addOffender('smallJsFiles', '%s (%s kB)', entry.url, sizeFormatted);
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
