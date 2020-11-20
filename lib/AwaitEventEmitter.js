const debug = require("debug")("phantomas:AwaitEventEmitter:emit"),
  Events = require("events");

// https://github.com/Psychopoulet/asynchronous-eventemitter/blob/master/lib/main.js
module.exports = class AwaitEventEmitter extends (
  Events
) {
  emit(eventName, ...args) {
    var eventPromises = [];

    if (eventName !== "scopeMessage") {
      debug(eventName);
    }

    this.listeners(eventName).forEach((fn) => {
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncFunction
      const ret = fn(...args);

      if (ret instanceof Promise) {
        eventPromises.push(ret);
      }

      // console.log(fn, fn.toString(), ret, ret instanceof Promise);
    });

    // console.log('%s Promise.all', eventName);
    return Promise.all(eventPromises);
  }
};
