/**
 * Delays report generation until given CSS selector can be resolved (i.e. given element exists)
 */
exports.version = '0.1';

function checkSelector(phantomas, selector) {
	var res = phantomas.evaluate(function(selector) {
		try {
			return document.querySelector(selector) !== null;
		}
		catch (ex) {
			return ex.toString();
		}
	}, selector);

	phantomas.log('Selector: query for "%s" returned %j', selector, res);
	return res;
}

exports.module = function(phantomas) {
	// e.g. --wait-for-selector "body.loaded"
	var selector = phantomas.getParam('wait-for-selector');

	if (typeof selector !== 'string') {
		return;
	}

	phantomas.log('Selector: will wait for "%s" selector', selector);

	phantomas.reportQueuePush(function(done) {
		phantomas.on('loadFinished', function() {
			var intervalId,
				pollFn;

			phantomas.log('Selector: starting polling of "%s" selector', selector);

			pollFn = function() {
				var res = checkSelector(phantomas, selector);

				// complete when selector is found or DOM exception is thrown
				if (res === true || typeof res === 'string') {
					clearInterval(intervalId);
					done();
				}
			};

			intervalId = setInterval(pollFn, 200);
			pollFn();
		});
	});
};
