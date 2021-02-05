/**
 * Sets a user agent according to --user-agent or --phone or --tablet options
 */
"use strict";

module.exports = function (phantomas) {
  // the user-agent template we use for all emulated devices
  let userAgent =
    "Mozilla/5.0 (<Platform>) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/<BrowserVersion> Safari/537.36 Phantomas/<PhantomasVersion>";

  // default platform for desktop
  let platform = "Windows NT 10.0; Win64; x64";

  // --phone option overwrites the default platform
  if (
    phantomas.getParam("phone") === true ||
    phantomas.getParam("phone-landscape") === true
  ) {
    platform = "Linux; Android 10; SM-G981B";
  }

  // --tablet option overwrites the default platform
  if (
    phantomas.getParam("tablet") === true ||
    phantomas.getParam("tablet-landscape") === true
  ) {
    platform = "Linux; Android 10; SM-T870";
  }

  // if --user-agent option is set, it overwrites --phone and --tablet
  // it can contain <Platform>, <BrowserVersion> and <PhantomasVersion> if needed
  const param = phantomas.getParam("user-agent");
  if (typeof param !== "undefined") {
    phantomas.log(
      "userAgent: --user-agent option detected with value %s",
      param
    );
    userAgent = param;
  }

  phantomas.on("init", async (page, browser) => {
    const browserVersion = await browser.version();
    // browserVersion will look like HeadlessChrome/88.0.4298.0
    // let's keep the number only:
    const versionNumber = browserVersion.split("/")[1];

    userAgent = userAgent.replace("<Platform>", platform);
    userAgent = userAgent.replace("<BrowserVersion>", versionNumber);
    userAgent = userAgent.replace("<PhantomasVersion>", phantomas.getVersion());

    // @see // https://github.com/GoogleChrome/puppeteer/blob/v1.11.0/docs/api.md#pagesetuseragentuseragent
    await page.setUserAgent(userAgent);
    phantomas.log("userAgent set to %s", userAgent);
  });
};
