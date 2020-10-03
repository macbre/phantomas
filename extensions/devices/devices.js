/**
 * Provides --phone, --phone-landscape, --tablet and --table-landscape options to force given device viewport and user agent.
 * Also supports the --viewport option to set any device resolution and pixel density ratio.
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

	var device,
		profileName;

	// check if --phone or --tablet option was passed
	Object.keys(availableDevices).forEach(function(item) {
		if (phantomas.getParam(item) === true) {
			device = item;
			return false;
		}
	});

	if (typeof device === 'undefined') {
		// no profile selected, add a hint to the logs
		phantomas.log('No profile selected (available: %s)', Object.keys(availableDevices).join(', '));
	} else {
		// apply the profile
		profileName = availableDevices[device];
		phantomas.log('Devices: %s provided - using "%s" profile: %j', device, profileName, devices[profileName]);
	}

	phantomas.on('init', async page => {
		
		if (profileName !== undefined) {
			// @see https://github.com/GoogleChrome/puppeteer/blob/v1.11.0/docs/api.md#pageemulateoptions
			await page.emulate(devices[profileName]);
			phantomas.log('page.emulate() called');
		}

		// if the user sets a viewport size, we assume he/she wants to overwrite the device values
		const viewport = phantomas.getParam('viewport');
		if (viewport !== undefined) {
			phantomas.log('Viewport: %s provided', viewport);
			
			// two syntaxes are supported:
			//  - 1200x800 for 1DPR screens
			//  - 1200x800x2 for high density screens
			const viewportValues = viewport.split('x');

			// @see https://github.com/puppeteer/puppeteer/blob/v1.11.0/docs/api.md#pagesetviewportviewport
			await page.setViewport({
				width: viewportValues[0],
				height: viewportValues[1],
				deviceScaleFactor: viewportValues[2] || 1
			});
			phantomas.log('page.setViewport() called');
		}
	});
};
