/**
 * Measure when the page reaches certain states
 */
"use strict";

module.exports = function (phantomas) {
  // @see http://w3c-test.org/webperf/specs/NavigationTiming/#dom-performancetiming-domloading
  // @see https://developers.google.com/web/fundamentals/performance/critical-rendering-path/measure-crp

  // times below are calculated relative to performance.timing.responseEnd (#117)
  // all values are in miliseconds!
  phantomas.setMetric("domInteractive"); // @desc time it took to parse the HTML and construct the DOM
  phantomas.setMetric("domContentLoaded"); // @desc time it took to construct both DOM and CSSOM, no stylesheets that are blocking JavaScript execution (i.e. onDOMReady)
  phantomas.setMetric("domContentLoadedEnd"); // @desc time it took to finish handling of onDOMReady event @unreliable
  phantomas.setMetric("domComplete"); // @desc time it took to load all page resources, the loading spinner has stopped spinning

  // get values from Resource Timing API (issue #477)
  phantomas.setMetric("performanceTimingConnect"); // @desc time it took to connect to the server before making the first HTTP request
  phantomas.setMetric("performanceTimingDNS"); // @desc time it took to resolve the domain before making the first HTTP request
  phantomas.setMetric("performanceTimingPageLoad"); // @desc time it took to fully load the page
  phantomas.setMetric("performanceTimingTTFB"); // @desc time it took to receive the first byte of the first HTTP response

  // backend vs frontend time
  phantomas.setMetric("timeBackend"); // @desc time to the first byte compared to the total loading time [%]
  phantomas.setMetric("timeFrontend"); // @desc time to window.load compared to the total loading time [%]

  phantomas.on("beforeClose", async function () {
    const timing = await phantomas.evaluate(() => {
      return window.performance.timing.toJSON();
    });

    phantomas.log("window.performance timing: %j", timing);

    // https://developer.mozilla.org/en-US/docs/Web/API/PerformanceTiming
    const base = timing.responseEnd;

    /**
		domInteractive: 60,
		domContentLoaded: 61,
		domContentLoadedEnd: 63,
		domComplete: 63,
		 */
    phantomas.setMetric("domInteractive", timing.domInteractive - base);
    phantomas.setMetric(
      "domContentLoaded",
      timing.domContentLoadedEventStart - base
    );
    phantomas.setMetric(
      "domContentLoadedEnd",
      timing.domContentLoadedEventEnd - base
    );
    phantomas.setMetric("domComplete", timing.domComplete - base);

    // see #477
    phantomas.setMetric(
      "performanceTimingConnect",
      timing.connectEnd - timing.connectStart
    );
    phantomas.setMetric(
      "performanceTimingDNS",
      timing.domainLookupEnd - timing.domainLookupStart
    );
    phantomas.setMetric(
      "performanceTimingPageLoad",
      timing.loadEventStart - timing.navigationStart
    );
    phantomas.setMetric(
      "performanceTimingTTFB",
      timing.responseStart - timing.navigationStart
    );

    /**
     * Emit metrics with backend vs frontend time
     *
     * Performance Golden Rule:
     * "80-90% of the end-user response time is spent on the frontend. Start there."
     *
     * @see http://www.stevesouders.com/blog/2012/02/10/the-performance-golden-rule/
     */
    //  The “backend” time is the time it takes the server to get the first byte back to the client.
    //  The “frontend” time is measured from the last byte of the response (responseEnd) until all resources are fetched (domComplete)
    const backendTime = parseInt(phantomas.getMetric("timeToFirstByte"), 10),
      frontendTime = parseInt(phantomas.getMetric("domComplete"), 10),
      totalTime = backendTime + frontendTime;

    if (totalTime === 0) {
      return;
    }

    const backendTimePercentage = Math.round((backendTime / totalTime) * 100);

    phantomas.setMetric("timeBackend", backendTimePercentage);
    phantomas.setMetric("timeFrontend", 100 - backendTimePercentage);
  });
};
