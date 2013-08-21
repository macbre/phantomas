/**
 * Aborts requests to external resources or given domains
 *
 * Does not emit any metrics
 */
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
		blockedDomainsRegExp,

		// stats
		blockedRequests = 0,
		blockedRequestsByDomains = {};

	function checkBlock(domain) {
		var blocked = false;

		// --no-externals
		if (noExternalsMode && domain !== ourDomain) {
			blocked = true;
		}

		// match blacklist (--block-domain)
		blocked = blockedDomainsRegExp && blockedDomainsRegExp.test(domain) ? true : blocked;

		// match whitelist (--allow-domain)
		blocked = allowedDomainsRegExp && allowedDomainsRegExp.test(domain) ? false : blocked;

		return blocked;
	}

	// parse settings
	allowedDomains = (typeof allowedDomains === 'string') ? allowedDomains.split(',') : false;
	blockedDomains = (typeof blockedDomains === 'string') ? blockedDomains.split(',') : false;

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

	// check each request before sending
	phantomas.on('beforeSend', function(entry) {
		if (ourDomain === false) {
			ourDomain = entry.domain;
			phantomas.log('Assuming ' + ourDomain + ' to be the main domain');
		}

		if (checkBlock(entry.domain)) {
			entry.block();

			// stats
			blockedRequests++;
			blockedRequestsByDomains[entry.domain] = 1;
		}
	});

	// debug information
	phantomas.on('report', function() {
		if (blockedRequests > 0) {
			phantomas.addNotice('Blocked requests: ' + blockedRequests + ' (from ' + Object.keys(blockedRequestsByDomains).join(', ') + ')');
		}
	});
};
