/**
 * Provides metrics for time to first image, CSS and JS file
 *
 * setMetric('timeToFirstCss')   @desc time it took to receive the last byte of the first CSS @offenders
 * setMetric('timeToFirstJs')    @desc time it took to receive the last byte of the first JS @offenders
 * setMetric('timeToFirstImage') @desc time it took to receive the last byte of the first image @offenders
 */
'use strict';

exports.version = '0.1';

exports.module = function(phantomas) {
	function capitalize(txt) {
		return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
	}

	var types = ['css', 'js', 'image'],
		hasReceived = {},
		timestampStart;

	// init metrics
	types.forEach(function(key) {
		phantomas.setMetric('timeToFirst' + capitalize(key));
	});

	// register the timestamp when the request for the page was sent
	phantomas.on('pageOpen', function() {
		timestampStart = Date.now();
	});

	phantomas.on('recv', function(entry, res) {
		var type = entry.type,
			time = 0,
			metricName = '';

		// report only the first asset of supported type
		if ((types.indexOf(type) === -1) || (typeof hasReceived[type] !== 'undefined')) {
			return;
		}

		// calculate relative timestamp
		time = Date.now() - timestampStart;

		metricName = 'timeToFirst' + capitalize(type);

		phantomas.setMetric(metricName, time);
		phantomas.addOffender(metricName, entry.url + ' received in ' + time + ' ms');

		// set the flag
		hasReceived[type] = true;
	});
};
