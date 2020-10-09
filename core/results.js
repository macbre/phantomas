/**
 * Simple results wrapper
 *
 * Will be passed via events and to formatters
 */
"use strict";

function getAverage(arr) {
  var sum = arr.reduce(function (a, b) {
    return a + b;
  });
  return sum / arr.length;
}

module.exports = function (data) {
  var asserts = {},
    generator = "",
    metrics = {},
    metricsAvgStorage = {},
    offenders = {},
    url;

  if (data) {
    asserts = data.asserts || {};
    generator = data.generator;
    metrics = data.metrics;
    offenders = data.offenders;
    url = data.url;
  }

  // public API
  return {
    // metrics
    setMetric: function (metricName, value) {
      // default to zero when no value is provided
      metrics[metricName] = typeof value !== "undefined" ? value : 0;

      // make the order of offenders match the order of metrics
      if (typeof offenders[metricName] === "undefined") {
        offenders[metricName] = undefined;
      }
    },
    // increements given metric by given number (default is one)
    incrMetric: function (name, incr /* =1 */) {
      var currVal = this.getMetric(name) || 0;
      this.setMetric(name, currVal + (typeof incr === "number" ? incr : 1));
    },
    // push a value and update the metric if the current average value
    addToAvgMetric: function (name, value) {
      if (typeof metricsAvgStorage[name] === "undefined") {
        metricsAvgStorage[name] = [];
      }

      metricsAvgStorage[name].push(value);

      this.setMetric(name, getAverage(metricsAvgStorage[name]));
    },
    getMetric: function (name) {
      return metrics[name];
    },
    getMetrics: function () {
      return metrics;
    },
    getMetricsNames: function () {
      return Object.keys(metrics);
    },

    // offenders
    addOffender: function (metricName, msg) {
      if (typeof offenders[metricName] === "undefined") {
        offenders[metricName] = [];
      }

      offenders[metricName].push(msg);
    },

    getOffenders: function (metricName) {
      return offenders[metricName];
    },

    getAllOffenders: function () {
      return offenders;
    },

    // set URL report was generated for
    setUrl: function (val) {
      url = val;
    },
    getUrl: function () {
      return url;
    },

    // generator - phantomas vX.X.X
    setGenerator: function (val) {
      generator = val;
    },
    getGenerator: function () {
      return generator;
    },

    // asserts handling
    setAssert: function (metric, val) {
      asserts[metric] = val;
    },
    setAsserts: function (val) {
      asserts = val || {};
    },
    getAsserts: function () {
      return asserts;
    },
    hasAssertion: function (metric) {
      return typeof asserts[metric] !== "undefined";
    },
    getAssertion: function (metric) {
      return asserts[metric];
    },

    // assertions
    assert: function (metric) {
      var expected = this.getAssertion(metric),
        val = this.getMetric(metric);

      if (!this.hasAssertion(metric) || typeof val === "undefined") {
        return true;
      }

      return typeof val === "number" ? val <= expected : true;
    },
    getFailedAsserts: function () {
      return this.getMetricsNames().filter(function (metric) {
        return this.assert(metric) === false;
      }, this);
    },
  };
};
