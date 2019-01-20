/**
 * Number of requests it took to make the page enter DomContentLoaded and DomComplete states accordingly
 */
'use strict';

module.exports = function(phantomas) {
	phantomas.setMetric('requestsToFirstPaint'); // @desc number of HTTP requests it took to make the first paint
	phantomas.setMetric('domainsToFirstPaint'); // @desc number of domains used to make the first paint @offenders @offenders
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
			phantomas.addOffender(metricName, {domain, requests:cnt});
		});
	}

	phantomas.on('recv', entry => {
		//phantomas.log('requestsTo: #%d <%s> / %s', requests, entry.url, entry.domain);

		requests++;

		if (entry.domain) {
			domains.push(entry.domain);
		}
	});

	phantomas.on('milestone', name => {
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
