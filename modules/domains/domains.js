/**
 * Domains monitor
 */
'use strict';

exports.version = '0.3';

var Stats = require('../../lib/fast-stats').Stats;

exports.module = function(phantomas) {
	var Collection = require('../../lib/collection'),
		domains = new Collection();

	phantomas.setMetric('domains'); // @desc number of domains used to fetch the page @offenders
	phantomas.setMetric('maxRequestsPerDomain'); // @desc maximum number of requests fetched from a single domain
	phantomas.setMetric('medianRequestsPerDomain'); // @desc median of number of requests fetched from each domain

	phantomas.on('recv', function(entry, res) {
		var domain = entry.domain;

		if (domain) {
			domains.push(domain);
		}
	});

	// add metrics
	phantomas.on('report', function() {
		var domainsRequests = new Stats();

		domains.sort().forEach(function(name, cnt) {
			phantomas.addOffender('domains', '%s: %d request(s)', name, cnt);

			domainsRequests.push(cnt);
		});

		if (domains.getLength() > 0) {
			phantomas.setMetric('domains', domains.getLength());
			phantomas.setMetric('maxRequestsPerDomain', domainsRequests.range()[1]);
			phantomas.setMetric('medianRequestsPerDomain', domainsRequests.median());
		}
	});
};
