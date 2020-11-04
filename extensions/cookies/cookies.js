/**
 * Support for cookies
 */
"use strict";

module.exports = function (phantomas) {
  function parseCookies(domain) {
    // --cookie='bar=foo;domain=url'
    // for multiple cookies, please use pipe-separated string (issue #667)
    // --cookie='foo=42|test=123'
    const COOKIE_SEPARATOR = "|",
      cookieParam = phantomas.getParam("cookie", false),
      cookiesJar = [];

    if (cookieParam !== false) {
      phantomas.log('Cookies: parsing "cookie" parameter'); // issue #667
      phantomas.log("Cookies: %j", cookieParam);

      cookieParam.split(COOKIE_SEPARATOR).forEach(function (cookieParam) {
        // Parse cookie. at minimum, need a key=value pair, and a domain.
        // Domain attr, if unavailble, is created from `phantomas.url` during
        //  addition to phantomjs in injectCookies function
        // Full JS cookie syntax is supported.
        var cookieComponents = cookieParam.split(";"),
          cookie = {};

        for (var i = 0, len = cookieComponents.length; i < len; i++) {
          var frag = cookieComponents[i].split("=");

          // special case: key-value
          if (i === 0) {
            cookie.name = frag[0];
            cookie.value = frag[1];

            // special case: secure
          } else if (frag[0] === "secure") {
            cookie.secure = true;

            // everything else
          } else {
            cookie[frag[0]] = frag[1];
          }

          cookie.domain = domain;
        }

        // see injectCookies for validation
        cookiesJar.push(cookie);
      });
    }

    return cookiesJar;
  }

  phantomas.on("init", async (page) => {
    const url = phantomas.getParam("url"),
      domain = new URL(url).hostname;

    // domain field in cookies needs to be set
    // https://github.com/miyakogi/pyppeteer/issues/94#issuecomment-403261859
    const cookies = parseCookies(domain);

    phantomas.log("Cookies: %j", cookies);

    // https://github.com/GoogleChrome/puppeteer/blob/v1.11.0/docs/api.md#pagesetcookiecookies
    if (cookies.length > 0) {
      await page.setCookie(...cookies);

      phantomas.log("Cookies: set up");
    }
  });
};
