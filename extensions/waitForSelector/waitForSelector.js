/**
 * Delays report generation until given CSS selector can be resolved (i.e. given element exists)
 */
/* global document: true */
'use strict';

exports.version = '0.2';

function checkSelector(phantomas, selector) {
	var res = phantomas.evaluate(function(selector) {
		return (function(phantomas) {
			try {
				var result;

				phantomas.spyEnabled(false, 'checking the selector');
				result = (document.querySelector(selector) !== null);
				phantomas.spyEnabled(true);

				return result;
			} catch (ex) {
				return ex.toString();
			}
		}(window.__phantomas));
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
