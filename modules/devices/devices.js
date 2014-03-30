/**
 * Provides --phone and --tabled options to force given device viewport and user agent
 *
 * @see https://github.com/macbre/phantomas/issues/213
 */
'use strict';

exports.version = '0.1';

exports.module = function(phantomas) {
	var device,
		// @see https://developers.google.com/chrome/mobile/docs/user-agent?hl=pl
		// @see http://viewportsizes.com/
		devices = {
			// pretend we're iPhone
			phone: {
				viewport: '320x568',
				'user-agent': 'Mozilla/5.0 (iPhone; U; CPU like Mac OS X; en) AppleWebKit/420+ (KHTML, like Gecko) Version/3.0 Mobile/1A543 Safari/419.3'
			},
			// pretend we're iPad
			tablet: {
				viewport: '768x1024',
				'user-agent': 'Mozilla/5.0 (iPad; U; CPU OS 3_2 like Mac OS X; en-us) AppleWebKit/531.21.10 (KHTML, like Gecko) Version/4.0.4 Mobile/7B334b Safari/531.21.10'
			}
		},
		availableDevices = Object.keys(devices);

	// check if --phone or --tablet option was passed
	availableDevices.forEach(function(item) {
		if (phantomas.getParam(item) === true) {
			device = item;
			return false;
		}
	});

	// no profile selected, add a hint to the logs
	if (typeof device === 'undefined') {
		phantomas.log('Devices: no profile selected (available: %s)', availableDevices.join(', '));
		return;
	}

	// apply the profile
	phantomas.log('Devices: using "%s" profile', device);

	Object.keys(devices[device]).forEach(function(key) {
		phantomas.setParam(key, devices[device][key]);
	});
};
