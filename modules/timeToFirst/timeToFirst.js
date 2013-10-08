/**
 * Provides metrics for time to first image, CSS and JS file
 */
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
			time = 0;

		// report only the first asset of supported type
		if ( (types.indexOf(type) === -1) || (hasReceived[type] === true) ) {
			return;
		}

		// calculate relative timestamp
		time = Date.now() - timestampStart;

		phantomas.setMetric('timeToFirst' + capitalize(type), time);
		phantomas.addNotice('First ' + type + ' received in ' + time + ' ms: <' + entry.url + '>');

		// set the flag
		hasReceived[type] = true;
	});
};
