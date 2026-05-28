/**
 * Provides --phone, --phone-landscape, --tablet and --table-landscape options to force given device viewport and user agent.
 */
"use strict";

module.exports = function (phantomas) {
  // @see https://github.com/puppeteer/puppeteer/blob/main/packages/puppeteer-core/src/common/Device.ts
  const availableDevices = {
    phone: "Galaxy S5", // 360x640
    "phone-landscape": "Galaxy S5 landscape", // 640x360
    tablet: "Kindle Fire HDX", // 800x1200
    "tablet-landscape": "Kindle Fire HDX landscape", // 1280x800
  };

  let device;

  // check if --phone or --tablet option was passed
  Object.keys(availableDevices).forEach(function (item) {
    if (phantomas.getParam(item) === true) {
      device = item;
      return false;
    }
  });

  // no profile selected, add a hint to the logs
  if (typeof device === "undefined") {
    phantomas.log(
      "No profile selected (available: %s)",
      Object.keys(availableDevices).join(", "),
    );
    return;
  }

  // apply the profile
  const profileName = availableDevices[device];

  phantomas.on("init", async (page) => {
    const { KnownDevices } = await import("puppeteer");
    const deviceProfile = KnownDevices[profileName];

    phantomas.log(
      'Devices: %s provided - using "%s" profile: %j',
      device,
      profileName,
      deviceProfile,
    );

    // @see https://github.com/GoogleChrome/puppeteer/blob/v1.11.0/docs/api.md#pageemulateoptions
    await page.emulate(deviceProfile);
    phantomas.log("page.emulate() called");
  });
};
