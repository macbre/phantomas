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
				'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_0_2 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13A452 Safari/601.1'
			},
			// pretend we're iPad
			tablet: {
				viewport: '768x1024',
				'user-agent': 'Mozilla/5.0 (iPad; CPU OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B5110e Safari/601.1'
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
