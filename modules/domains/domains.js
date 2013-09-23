/**
 * Domains monitor
 */
exports.version = '0.2';

exports.module = function(phantomas) {
	var domains = {};
	phantomas.setMetric('domains');
	phantomas.setMetric('maxRequestsPerDomain');
	phantomas.setMetric('medianRequestsPerDomain');

	phantomas.on('recv', function(entry,res) {
		var domain = entry.domain;

		// base64?
		if (!domain) {
			return;
		}

		// init domain entry
		if (!domains[domain]) {
			domains[domain] = {
				requests: []
			};
		}

		domains[domain].requests.push(res.url);
	});

	// add metrics
	phantomas.on('report', function() {
		var domainsStats = [],
			domainsRequests = [];

		// TODO: implement phantomas.collection
		Object.keys(domains).forEach(function(domain) {
			var cnt = domains[domain].requests.length;

			domainsStats.push({
				name: domain,
				cnt: cnt
			});

			domainsRequests.push(cnt);
		});

		domainsStats.sort(function(a, b) {
			return (a.cnt > b.cnt) ? -1 : 1;
		});

		if (domainsStats.length > 0) {
			phantomas.setMetric('domains', domainsStats.length);
			phantomas.setMetric('maxRequestsPerDomain', domainsStats[0].cnt);
			phantomas.setMetric('medianRequestsPerDomain', phantomas.median(domainsRequests));
		}

		phantomas.addNotice('Requests per domain:');
		domainsStats.forEach(function(domain) {
			phantomas.addNotice(' ' + domain.name + ': ' + domain.cnt + ' request(s)');
		});
		phantomas.addNotice();
	});
};
