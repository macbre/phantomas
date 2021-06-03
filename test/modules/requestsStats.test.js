/**
 * Test requestsStats core module
 */
const mock = require("./mock"),
  { describe } = require("@jest/globals");

describe("requestsStats", () => {
  describe("registers requests", () => {
    mock.getContext(
      "requestsStats",
      (phantomas) => {
        var requests = [
          {
            status: 200,
            responseSize: 25,
            timeToFirstByte: 3,
            timeToLastByte: 5,
          },
          {
            status: 200,
            responseSize: 2245,
            timeToFirstByte: 1,
            timeToLastByte: 11,
          },
          {
            status: 200,
            responseSize: 205,
            timeToFirstByte: 2,
            timeToLastByte: 2,
          },
        ];

        requests.forEach(phantomas.recv, phantomas);

        // calculate metrics
        return phantomas.report();
      },
      {
        smallestResponse: 25,
        biggestResponse: 2245,
        fastestResponse: 2,
        slowestResponse: 11,
        smallestLatency: 1,
        biggestLatency: 3,
        medianResponse: 5,
        medianLatency: 2,
      }
    );
  });

  describe("ignores non-200 responses", () => {
    mock.getContext(
      "requestsStats",
      (phantomas) => {
        var requests = [
          {
            status: 200,
            responseSize: 50,
          },
          // this one should be skipped
          {
            status: 404,
            responseSize: 150,
          },
        ];

        requests.forEach(phantomas.recv, phantomas);

        // calculate metrics
        return phantomas.report();
      },
      {
        smallestResponse: 50,
        biggestResponse: 50,
      }
    );
  });

  describe("does not emit any metrics if there were no requests", () => {
    mock.getContext(
      "requestsStats",
      (phantomas) => {
        // calculate metrics
        return phantomas.report();
      },
      {
        smallestResponse: undefined,
        biggestResponse: undefined,
      }
    );
  });
});
