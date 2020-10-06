(function (phantomas) {
  // spy calls to EventTarget.addEventListener
  // @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget.addEventListener
  function eventSpy(eventType) {
    var path = phantomas.getDOMPath(this);
    phantomas.log('DOM event: "' + eventType + '" bound to "' + path + '"');

    phantomas.incrMetric("eventsBound");
    phantomas.addOffender("eventsBound", { eventType, path });

    // count window.addEventListener('scroll', ...) - issue #508
    if (eventType === "scroll" && (path === "window" || path === "#document")) {
      phantomas.incrMetric("eventsScrollBound");
      phantomas.addOffender("eventsScrollBound", { element: path });
    }
  }

  phantomas.spy(Element.prototype, "addEventListener", eventSpy);
  phantomas.spy(Document.prototype, "addEventListener", eventSpy);
  phantomas.spy(window, "addEventListener", eventSpy);

  // spy calls to EventTarget.dispatchEvent
  // @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget.dispatchEvent
  phantomas.spy(Element.prototype, "dispatchEvent", function (ev) {
    var path = phantomas.getDOMPath(this);

    phantomas.log('Core JS event: triggered "%s" on "%s"', ev.type, path);

    phantomas.incrMetric("eventsDispatched");
    phantomas.addOffender("eventsDispatched", { eventType: ev.type, path });
  });
})(window.__phantomas);
