/**
 * Domains monitor
 */
exports.version = '0.1';

exports.module = function(phantomas) {
	// count requests per domain
	var domains = {},
		domainsCount = 0;

	phantomas.on('recv', function(entry,res) {
		var domain = entry.domain;

		// base64?
		if (!domain) {
			return;
		}

		// init domain entry
		if (!domains[domain]) {
			domainsCount++;

			domains[domain] = {
				requests: []
			};
		}

		domains[domain].requests.push(res.url);
	});

	// add metrics
	phantomas.on('loadFinished', function() {
		//console.log(domains);
		phantomas.setMetric('domains', domainsCount);

		phantomas.addNotice('Requests per domain:');
		for(var domain in domains) {
			var entry = domains[domain],
				requests = entry.requests;

			// report URLs from each domain
			phantomas.addNotice(' ' + domain + ': ' + requests.length + ' request(s)');
			requests.forEach(function(url) {
				//phantomas.addNotice('   * ' + url);
			});
		}
		phantomas.addNotice();
	});
};
