/**
 * Analyzes static assets (CSS, JS and images)
 */
exports.version = '0.2';

exports.module = function(phantomas) {
	var BASE64_SIZE_THRESHOLD = 2 * 1024;

	// count requests for each asset
	var assetsReqCounter = {};

	phantomas.setMetric('assetsNotGzipped');
	phantomas.setMetric('assetsWithQueryString');
	phantomas.setMetric('smallImages');
	phantomas.setMetric('multipleRequests');

	phantomas.on('recv', function(entry, res) {
		// console.log(JSON.stringify(entry));
		var isContent = entry.status === 200;

		// check for query string -> foo.css?123
		if (entry.isImage || entry.isJS || entry.isCSS) {
			if (entry.url.indexOf('?') > -1) {
				phantomas.log('Query string: <' + entry.url + '> (' + entry.type.toUpperCase() + ') served with query string');
				phantomas.incrMetric('assetsWithQueryString');
			}
		}

		// check for not-gzipped CSS / JS / HTML files
		if (entry.isJS || entry.isCSS || entry.isHTML) {
			if (!entry.gzip && isContent) {
				phantomas.log('GZIP: <' + entry.url + '> (' + entry.type.toUpperCase() + ') served without compression');
				phantomas.incrMetric('assetsNotGzipped');
			}
		}

		// check small images that can be base64 encoded
		if (entry.isImage) {
			if (entry.bodySize < BASE64_SIZE_THRESHOLD) {
				phantomas.log('base64: <' + entry.url + '> (' + (entry.bodySize/1024).toFixed(2) + ' kB) should be considered to be served base64-encoded');
				phantomas.incrMetric('smallImages');
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
