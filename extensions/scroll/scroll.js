/**
 * Allow page to be scrolled after it is loaded
 *
 * Pass --scroll as an option in CLI mode
 */
/* global document: true, window: true */
"use strict";

module.exports = function (phantomas) {
  const scroll = phantomas.getParam("scroll") === true;

  if (!scroll) {
    phantomas.log(
      "Scroll: pass --scroll option to scroll down the page when it's loaded"
    );
    return;
  }

  phantomas.log("Scroll: the page will be scrolled down when loaded");

  phantomas.on("beforeClose", (page) => {
    return new Promise(async (resolve) => {
      phantomas.log("Scrolling the page...");

      await page.evaluate(() => document.body.scrollIntoView(false));
      const scrollOffset = await page.evaluate(() => document.body.scrollTop);

      // wait for lazy loading to do its job
      phantomas.log("Scrolled the page to %d px, wait a bit", scrollOffset);
      phantomas.emit("scroll", scrollOffset);

      setTimeout(resolve, 500);
    });
  });
};
