/**
 * Provides --phone, --phone-landscape, --tablet and --table-landscape options to force given device viewport and user agent.
 */
'use strict';

module.exports = function(phantomas) {
  const puppeteer = require('puppeteer'),
	  devices = puppeteer.devices,
		// @see https://github.com/GoogleChrome/puppeteer/blob/master/DeviceDescriptors.js
		availableDevices = {
			'phone': 'Galaxy S5', // 360x640
			'phone-landscape': 'Galaxy S5 landscape', // 640x360
			'tablet': 'Kindle Fire HDX', // 800x1200
			'tablet-landscape': 'Kindle Fire HDX landscape', // 1280x800
		};

	var device;

	// check if --phone or --tablet option was passed
	Object.keys(availableDevices).forEach(function(item) {
		if (phantomas.getParam(item) === true) {
			device = item;
			return false;
		}
	});

	// no profile selected, add a hint to the logs
	if (typeof device === 'undefined') {
		phantomas.log('No profile selected (available: %s)', Object.keys(availableDevices).join(', '));
		return;
	}

	// apply the profile
	const profileName = availableDevices[device];

	phantomas.log('Devices: %s provided - using "%s" profile: %j', device, profileName, devices[profileName]);

	phantomas.on('init', async page => {
		// @see https://github.com/GoogleChrome/puppeteer/blob/v1.11.0/docs/api.md#pageemulateoptions
		await page.emulate(devices[profileName]);
		phantomas.log('page.emulate() called');
	});
};