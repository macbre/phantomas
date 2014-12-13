/**
 * Delays report generation until given phantomas event is emitted (issue #453)
 */
'use strict';

exports.version = '0.1';

exports.module = function(phantomas) {
	// e.g. --wait-for-event "done"
	var eventName = phantomas.getParam('wait-for-event');

	if (typeof eventName !== 'string') {
		return;
	}

	phantomas.log('Waiting for event: will wait for "%s" event', eventName);

	phantomas.reportQueuePush(function(done) {
		phantomas.on(eventName, done);
	});
};
