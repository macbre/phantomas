/**
 * Analyzes X-Cache headers from caching servers like Squid or Varnish
 */
exports.version = '0.1';

exports.module = function(phantomas) {
	phantomas.setMetric('cacheHits');
	phantomas.setMetric('cacheMisses');
	phantomas.setMetric('cachePasses');

	var re = /miss|hit|pass/i;
	
	// examples:
	// X-Cache:HIT, HIT
	// X-Cache:arsenic miss (0)
	phantomas.on('recv', function(entry,res) {
		var header = (entry.headers['X-Cache'] || '').toLowerCase(),
			isHit,
			isPass;

		if (re.test(header)) {
			isHit = header.indexOf('hit') > -1;
			if (isHit) {
				phantomas.incrMetric('cacheHits');
			}
			else {
				isPass = header.indexOf('pass') > -1;
				if (isPass) {
					phantomas.incrMetric('cachePasses');
					phantomas.addOffender('cachePasses', entry.url);
					phantomas.log('Cache pass: on <' + entry.url + '> (X-Cache: ' + header + ')');
				}
				else {
					phantomas.incrMetric('cacheMisses');
					phantomas.log('Cache miss: on <' + entry.url + '> (X-Cache: ' + header + ')');
				}
			}
		}
	});
};
