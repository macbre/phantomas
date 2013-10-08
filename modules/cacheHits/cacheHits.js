/**
 * Analyzes X-Cache headers from caching servers like Squid or Varnish
 */
exports.version = '0.1';

exports.module = function(phantomas) {
	phantomas.setMetric('cacheHits');
	phantomas.setMetric('cacheMisses');

	var re = /miss|hit/i;
	
	// examples:
	// X-Cache:HIT, HIT
	// X-Cache:arsenic miss (0)
	phantomas.on('recv', function(entry,res) {
		var header = entry.headers['X-Cache'] || '',
			isHit;

		if (re.test(header)) {
			isHit = header.toLowerCase().indexOf('hit') > -1;
			phantomas.incrMetric(isHit ? 'cacheHits' : 'cacheMisses');

			if (!isHit) {
				phantomas.log('Cache miss: on <' + entry.url + '> (X-Cache: ' + header + ')');
			}
		}
	});
};
