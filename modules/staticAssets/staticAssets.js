/**
 * Analyzes static assets (CSS, JS and images)
 */
exports.version = '0.1';

exports.module = function(phantomas) {
	phantomas.setMetric('assetsNotGzipped');
	phantomas.setMetric('assetsWithQueryString');

	phantomas.on('recv', function(entry, res) {
		// console.log(JSON.stringify(entry));

		// check for query string -> foo.css?123
		if (entry.isImage || entry.isJS || entry.isCSS) {
			if (entry.url.indexOf('?') > -1) {
				phantomas.addNotice(entry.url + ' (' + entry.type.toUpperCase() + ') served with query string');
				phantomas.incrMetric('assetsWithQueryString');
			}
		}

		// check for not-gzipped CSS / JS / HTML files
		if (entry.isJS || entry.isCSS || entry.isHTML) {
			if (!entry.gzip) {
				phantomas.addNotice(entry.url + ' (' + entry.type.toUpperCase() + ') served without compression');
				phantomas.incrMetric('assetsNotGzipped');
			}
		}
	});
};
