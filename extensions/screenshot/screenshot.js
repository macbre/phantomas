/**
 * Renders a screenshot of the full page when it's fully loaded
 */
"use strict";

module.exports = function (phantomas) {
  const workingDirectory = require("process").cwd(),
    param = phantomas.getParam("screenshot"),
    fullPage = phantomas.getParam("fullPageScreenshot");
  var path = "";

  if (typeof param === "undefined") {
    phantomas.log(
      "Screenshot: to enable screenshot of the page run phantomas with --screenshot option"
    );
    return;
  }

  if (fullPage === true) {
    // the full page option is now disabled by default (bug #853)
    phantomas.log(
      "Screenshot: --full-page-screenshot option enabled. Please note that the option can cause layout bugs and lazyloadableImagesUnderTheFold miscount"
    );
  }

  // --screenshot
  if (param === true) {
    // defaults to "2013-12-07T20:15:01.521Z.png"
    path = new Date().toJSON().replace(/:/g, "-"); // be M$ Windows compatible (issue #454)

    path += ".png";
  }
  // --screenshot [file name]
  else {
    path = param;
  }

  // deal with relative paths
  if (path.indexOf("/") !== 0) {
    path = workingDirectory + "/" + path;
  }

  phantomas.log("Screenshot will be saved in %s", path);

  phantomas.on("beforeClose", (page) => {
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
    return new Promise(async (resolve) => {
      const options = {
        path: path,
        type: "png",
        fullPage: fullPage === true,
      };
      phantomas.log("Will take screenshot, options: %j", options);

      try {
        // https://github.com/GoogleChrome/puppeteer/blob/v1.11.0/docs/api.md#pagescreenshotoptions
        await page.screenshot(options);

        phantomas.log("Screenshot stored in %s", path);

        // let clients know that we stored the page source in a file
        phantomas.emit("screenshot", path);
      } catch (err) {
        phantomas.log("Error while taking the screenshot");
        phantomas.log(err);
      }

      resolve();
    });
  });
};
