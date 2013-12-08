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
			Stats = require('fast-stats').Stats,
			domainsRequests = new Stats();

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
			phantomas.setMetric('maxRequestsPerDomain', domainsRequests.range()[1]);
			phantomas.setMetric('medianRequestsPerDomain', domainsRequests.median());
		}

		domainsStats.forEach(function(domain) {
			phantomas.addOffender('domains', domain.name + ': ' + domain.cnt + ' request(s)');
		});
	});
};
