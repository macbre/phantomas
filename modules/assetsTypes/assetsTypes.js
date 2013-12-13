/**
 * Analyze number of requests and sizes of differet assets types
 */
exports.version = '0.1';

exports.module = function(phantomas) {
	['html', 'css', 'js', 'json', 'image', 'webfont', 'base64', 'other'].forEach(function(key) {
		phantomas.setMetric(key + 'Count');
		phantomas.setMetric(key + 'Size');
	});

	phantomas.on('recv', function(entry, res) {
		phantomas.incrMetric(entry.type + 'Count');
		phantomas.incrMetric(entry.type + 'Size', entry.bodySize);

		phantomas.addOffender(entry.type + 'Count', entry.url + ' (' + (entry.bodySize / 1024).toFixed(2)  + ' kB)');
	});

	phantomas.on('base64recv', function(entry, res) {
		phantomas.incrMetric('base64Count');
		phantomas.incrMetric('base64Size', entry.bodySize);
	});
};
