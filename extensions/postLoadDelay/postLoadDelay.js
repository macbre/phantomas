/**
 * Delays report generation for a given time
 */
'use strict';

exports.version = '0.1';

exports.module = function(phantomas) {
	// e.g. --post-load-delay 5
	var delay = parseInt(phantomas.getParam('post-load-delay'), 10);

	if (!delay) {
		return;
	}

	phantomas.log('Post load delay: will wait %d second(s) after onload', delay);

	phantomas.reportQueuePush(function(done) {
		phantomas.on('loadFinished', function() {
			setInterval(done, delay * 1000);
		});
	});
};
