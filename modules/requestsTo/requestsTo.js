/**
 * Number of requests it took to make the page enter DomContentLoaded and DomComplete states accordingly
 */
'use strict';

exports.version = '1.0';

exports.module = function(phantomas) {
	phantomas.setMetric('requestsToFirstPaint'); // @desc number of HTTP requests it took to make the first paint @gecko
	phantomas.setMetric('domainsToFirstPaint'); // @desc number of domains used to make the first paint @offenders @gecko @offenders
	phantomas.setMetric('requestsToDomContentLoaded'); // @desc number of HTTP requests it took to make the page reach DomContentLoaded state
	phantomas.setMetric('domainsToDomContentLoaded'); // @desc number of domains used to make the page reach DomContentLoaded state @offenders
	phantomas.setMetric('requestsToDomComplete'); // @desc number of HTTP requests it took to make the page reach DomComplete state
	phantomas.setMetric('domainsToDomComplete'); // @desc number of domains used to make the page reach DomComplete state @offenders

	var Collection = require('../../lib/collection'),
		domains = new Collection(),
		requests = 0;

	function setDomainMetric(metricName) {
		phantomas.setMetric(metricName, domains.getLength());
		domains.sort().forEach(function(domain, cnt) {
			phantomas.addOffender(metricName, '%s (%d requests)', domain, cnt);
		});
	}

	phantomas.on('recv', function(entry, res) {
		//phantomas.log('requestsTo: #%d <%s> / %s', requests, entry.url, entry.domain);

		requests++;

		if (entry.domain) {
			domains.push(entry.domain);
		}
	});

	phantomas.on('milestone', function(name) {
		//phantomas.log('requestsTo: %s (after %d requests)', name, requests);

		switch (name) {
			case 'firstPaint':
				phantomas.setMetric('requestsToFirstPaint', requests);
				setDomainMetric('domainsToFirstPaint');
				break;

			case 'domInteractive':
				phantomas.setMetric('requestsToDomContentLoaded', requests);
				setDomainMetric('domainsToDomContentLoaded');
				break;

			case 'domComplete':
				phantomas.setMetric('requestsToDomComplete', requests);
				setDomainMetric('domainsToDomComplete');
				break;
		}
	});
};
