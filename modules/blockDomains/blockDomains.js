/**
 * Aborts requests to external resources or given domains
 *
 * Does not emit any metrics
 */
'use strict';

module.exports = function(phantomas) {
	const { parse } = require('url');

	var ourDomain,

		// --no-externals
		noExternalsMode = (phantomas.getParam('no-externals') === true),
		// --allow-domain .fastly.net,.googleapis.com
		allowedDomains = phantomas.getParam('allow-domain'),
		allowedDomainsRegExp,
		// --block-domain google-analytics.com
		blockedDomains = phantomas.getParam('block-domain'),
		blockedDomainsRegExp;

	ourDomain = parse(phantomas.getParam('url')).hostname;

	phantomas.setMetric('blockedRequests'); // @desc number of requests blocked due to domain filtering @optional

	function checkBlock(domain) {
		var blocked = false;

		// --no-externals
		if (noExternalsMode && ourDomain !== false && domain !== ourDomain) {
			blocked = true;
		}

		// match blacklist (--block-domain)
		if (blockedDomainsRegExp && blockedDomainsRegExp.test(domain)) {
			blocked = true;
		}

		// match whitelist (--allow-domain)
		if (allowedDomainsRegExp) {
			if (allowedDomainsRegExp.test(domain) || domain === ourDomain) {
				blocked = false;
			} else {
				blocked = true;
			}
		}

		return blocked;
	}

	// parse settings
	function parseParameter(value) {
		return value.
		split(',').
		map(function(item) {
			return item.trim();
		});
	}

	allowedDomains = (typeof allowedDomains === 'string') ? parseParameter(allowedDomains) : false;
	blockedDomains = (typeof blockedDomains === 'string') ? parseParameter(blockedDomains) : false;

	if (noExternalsMode) {
		phantomas.log('Block domains: working in --no-externals mode ("%s" is our domain)', ourDomain);
	}

	if (allowedDomains !== false) {
		phantomas.log('Block domains: whitelist - ' + allowedDomains.join(', '));
		allowedDomainsRegExp = new RegExp('(' + allowedDomains.join('|') + ')$');
	}

	if (blockedDomains !== false) {
		phantomas.log('Block domains: blacklist - ' + blockedDomains.join(', '));
		blockedDomainsRegExp = new RegExp('(' + blockedDomains.join('|') + ')$');
	}

	// https://github.com/GoogleChrome/puppeteer/blob/v1.11.0/docs/api.md#pagesetrequestinterceptionvalue
	phantomas.on('init', async (_, page) => {
		await page.setRequestInterception(true);

		page.on('request', interceptedRequest => {
			const url = interceptedRequest.url(),
				domain = parse(url).hostname;

			if (checkBlock(domain)) {
				interceptedRequest.abort();

				phantomas.log('Request has been blocked: <%s>', url);

				// stats
				phantomas.incrMetric('blockedRequests');
				phantomas.addOffender('blockedRequests', url);
			}
			else {
				interceptedRequest.continue();
			}
		  });

		  phantomas.log('Requests intercepting enabled');
	});
};
