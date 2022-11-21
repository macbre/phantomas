/* istanbul ignore next */
(function navigationTimingScope(phantomas) {
  // Prevent events from being sent from an iframe. Only from the main document.
  if (window.parent !== window || window.location.href === "about:blank") {
    return;
  }

  function emit(eventName) {
    phantomas.log("Navigation Timing milestone: %s", eventName);
    phantomas.emit("milestone", eventName); // @desc Page loading milestone has been reached: domInteractive, domReady and domComplete
  }

  document.addEventListener("DOMContentLoaded", function () {
    // both DOM and CSSOM are constructed, no stylesheets are blocking JavaScript execution
    emit("domReady");
  });

  // domInteractive and domComplete
  document.addEventListener("readystatechange", function () {
    var readyState = document.readyState;

    // @see http://www.w3.org/TR/html5/dom.html#documentreadystate
    switch (readyState) {
      // the browser has finished parsing all of the HTML and DOM construction is complete
      case "interactive":
        emit("domInteractive");
        break;

      // the processing is complete and all of the resources on the page have finished downloading
      case "complete":
        emit("domComplete");
        break;
    }
  });
})(window.__phantomas);
