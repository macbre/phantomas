/**
 * Analyzes static assets (CSS, JS and images)
 */
'use strict';

exports.version = '0.3';

exports.module = function(phantomas) {
	var BASE64_SIZE_THRESHOLD = 2 * 1024;

	// count requests for each asset
	var assetsReqCounter = {},
		// TODO: use 3pc database with tracking services
		trackingUrls = /google-analytics.com\/__utm.gif|pixel.quantserve.com\/pixel/;

	phantomas.setMetric('assetsNotGzipped'); // @desc number of static assets that were not gzipped @unreliable
	phantomas.setMetric('assetsWithQueryString'); // @desc number of static assets requested with query string (e.g. ?foo) in URL
	phantomas.setMetric('smallImages'); // @desc number of images smaller than 2 kB that can be base64 encoded @unreliable
	phantomas.setMetric('multipleRequests'); // @desc number of static assets that are requested more than once

	phantomas.on('recv', function(entry, res) {
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

		// count number of requests to each asset
		if (entry.isImage || entry.isJS || entry.isCSS) {
			if (typeof assetsReqCounter[entry.url] === 'undefined') {
				assetsReqCounter[entry.url] = 1;
			}
			else {
				assetsReqCounter[entry.url]++;
			}
		}
	});

	phantomas.on('report', function() {
		Object.keys(assetsReqCounter).forEach(function(asset) {
			if (assetsReqCounter[asset] > 1) {
				phantomas.incrMetric('multipleRequests');
				phantomas.addOffender('multipleRequests', asset);
			}
		});
	});
};
