/**
 * localStorage metrics
 */
/* global window: true */
'use strict';

module.exports = function(phantomas) {
	phantomas.setMetric('localStorageEntries'); // @desc number of entries in local storage

	return; // TODO

	phantomas.on('report', function() {
		phantomas.evaluate(function() {
			(function(phantomas) {
				var entries;

				try {
					entries = Object.keys(window.localStorage);

					phantomas.setMetric('localStorageEntries', entries.length);

					entries.forEach(function(entry) {
						phantomas.addOffender('localStorageEntries', entry);
					});
				} catch (ex) {
					phantomas.log('localStorageEntries: not set because ' + ex + '!');
				}
			}(window.__phantomas));
		});
	});
};
