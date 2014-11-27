/**
 * Analyzes if HTTP responses keep the connections alive.
 */
'use strict';

exports.version = '0.1';

exports.module = function(phantomas) {
	var closedConnectionHosts = {};

	phantomas.setMetric('closedConnections'); // @desc number of requests not keeping the connection alive and slowing down the next request

	phantomas.on('recv', function(entry, res) {
		var connectionHeader = (entry.headers.Connection || '').toLowerCase(),
			// Taking the protocol in account, in case the same domain is called with two different protocols.
			host = entry.protocol + '://' + entry.domain;

		if (connectionHeader.indexOf('close') !== -1) {
			// Don't blame it immediatly, wait to see if the connection is needed a second time.
			closedConnectionHosts[host] = entry.url;
		}
	});

	phantomas.on('send', function(entry, res) {
		var host = entry.protocol + '://' + entry.domain,
			previousClosedConnection = closedConnectionHosts[host];

		if (typeof previousClosedConnection !== 'undefined') {
			// There was a closed connection. We can blame it safely now!
			phantomas.incrMetric('closedConnections');
			phantomas.addOffender('closedConnections', previousClosedConnection);

			phantomas.log('keepAlive: connection for <%s> was closed, but the page requested <%s>', host, entry.url);

			closedConnectionHosts[host] = undefined;
		}
	});
};
