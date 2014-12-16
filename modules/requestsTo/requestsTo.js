/**
 * Number of requests it took to make the page enter DomContentLoaded and DomComplete states accordingly
 */
'use strict';

exports.version = '0.1';

exports.module = function(phantomas) {
	phantomas.setMetric('requestsToDomContentLoaded'); // @desc number of HTTP requests it took to make the page reach DomContentLoaded state
	phantomas.setMetric('requestsToDomComplete'); // @desc number of HTTP requests it took to make the page reach DomComplete state

	var requests = 0;

	phantomas.on('recv', function(entry, res) {
		requests++;
		//phantomas.log('requestsTo: #%d <%s>', requests, entry.url);
	});

	phantomas.on('milestone', function(name) {
		//phantomas.log('requestsTo: %s (after %d requests)', name, requests);

		switch (name) {
			case 'domInteractive':
				phantomas.setMetric('requestsToDomContentLoaded', requests);
				break;

			case 'domComplete':
				phantomas.setMetric('requestsToDomComplete', requests);
				break;
		}
	});
};
