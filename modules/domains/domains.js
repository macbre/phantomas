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

		if (!domain) {
			return;
		}

		// init domain entry
		if (!domains[domain]) {
			domainsCount++;

			domains[domain] = {
				requests: 0
			};
		}

		domains[domain].requests++;
	});

	// add metrics
	phantomas.on('loadFinished', function() {
		//console.log(domains);
		phantomas.setMetric('HTTPDomains', domainsCount);

		phantomas.addNotice('Requests per domain:');
		for(var domain in domains) {
			var entry = domains[domain];  

			phantomas.addNotice(' ' + domain + ': ' + entry.requests + ' request(s)');
		}
	});
};
