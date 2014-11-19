/**
 * Aborts requests to external resources or given domains
 *
 * Does not emit any metrics
 */
'use strict';

exports.version = '0.1';

exports.module = function(phantomas) {
	var ourDomain = false,

		// --no-externals
		noExternalsMode = (phantomas.getParam('no-externals') === true),
		// --allow-domain .fastly.net,.googleapis.com
		allowedDomains = phantomas.getParam('allow-domain'),
		allowedDomainsRegExp,
		// --block-domain google-analytics.com
		blockedDomains = phantomas.getParam('block-domain'),
		blockedDomainsRegExp;

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
		if (allowedDomainsRegExp && allowedDomainsRegExp.test(domain)) {
			blocked = false;
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
		phantomas.log('Block domains: working in --no-externals mode');
	}

	if (allowedDomains !== false) {
		phantomas.log('Block domains: whitelist - ' + allowedDomains.join(', '));
		allowedDomainsRegExp = new RegExp('(' + allowedDomains.join('|') + ')$');
	}

	if (blockedDomains !== false) {
		phantomas.log('Block domains: blacklist - ' + blockedDomains.join(', '));
		blockedDomainsRegExp = new RegExp('(' + blockedDomains.join('|') + ')$');
	}

	// get the "main" domain from the first request not being a redirect (issue #197)
	phantomas.on('responseEnd', function(entry, res) {
		ourDomain = entry.domain;
		phantomas.log('Block domains: assuming "%s" to be the main domain', ourDomain);
	});

	// check each request before sending
	phantomas.on('beforeSend', function(entry) {
		if (checkBlock(entry.domain)) {
			entry.block();

			// stats
			phantomas.incrMetric('blockedRequests'); // @desc number of requests blocked due to domain filtering @optional
			phantomas.addOffender('blockedRequests', entry.url);
		}
	});
};
