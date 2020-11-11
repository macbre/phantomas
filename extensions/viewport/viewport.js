/**
 * Provides the --viewport option to set any device resolution and pixel density ratio.
 * If the user sets a viewport size as well as a device option (--phone, --tablet, ...),
 * we assume that he or she wants to overwrite the device values.
 *
 * Two syntaxes are supported:
 *  - 1200x800 will set a 1x pixel density ratio
 *  - 1200x800x2 will set the given ratio (float values such as 1.5 are accepted)
 */
"use strict";

module.exports = function (phantomas) {
  const viewport = phantomas.getParam("viewport");

  if (viewport === undefined) {
    phantomas.log(
      "No viewport option specified, will use the device default viewport"
    );
    return;
  }

  phantomas.log("Viewport: %s provided", viewport);

  const viewportValues = viewport.split("x");
  const options = {
    width: parseInt(viewportValues[0], 10),
    height: parseInt(viewportValues[1], 10),
    deviceScaleFactor: parseFloat(viewportValues[2]) || 1,
  };

  phantomas.on("init", async (page) => {
    // @see https://github.com/puppeteer/puppeteer/blob/v1.11.0/docs/api.md#pagesetviewportviewport
    await page.setViewport(options);
    phantomas.log("page.setViewport() called with options %j", options);
  });
};
