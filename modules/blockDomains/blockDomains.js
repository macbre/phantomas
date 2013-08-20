/**
 * Aborts requests to external resources or given domains
 *
 * Does not emit any metrics
 */
exports.version = '0.1';

exports.module = function(phantomas) {
	var blockedRequests = 0,
		blockedDomains = {},
		ourDomain = false,
		// --no-externals
		noExternalsMode = (phantomas.getParam('no-externals') === true);

	function checkBlock(domain) {
		var block = false;

		if (noExternalsMode && domain !== ourDomain) {
			block = true;
		}

		return block;
	}

	if (noExternalsMode) {
		phantomas.log('Block domains: working in --no-externals mode');
	}

	// check each request before sending
	phantomas.on('beforeSend', function(entry) {
		if (ourDomain === false) {
			ourDomain = entry.domain;
			phantomas.log('Assuming ' + ourDomain + ' to be main domain');
		}

		if (checkBlock(entry.domain)) {
			entry.block();

			// stats
			blockedRequests++;
			blockedDomains[entry.domain] = 1;
		}
	});

	// debug information
	phantomas.on('report', function() {
		if (blockedRequests > 0) {
			phantomas.addNotice('Blocked requests: ' + blockedRequests + ' (from ' + Object.keys(blockedDomains).join(', ') + ')');
		}
	});
};
