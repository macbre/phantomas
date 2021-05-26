/**
 * Example script that uses phantomas npm module with promise pattern
 */
const phantomas = require("..");
const url = process.argv[2] || "http://127.0.0.1:8888/dom-operations.html";

console.log("phantomas v%s loaded from %s", phantomas.version, phantomas.path);
console.log("Opening <%s> ...", url);

const promise = phantomas(url, {
  "ignore-ssl-errors": true,
});

//console.log('Results: %s', promise);

// metrics metadata
//console.log('Number of available metrics: %d', phantomas.metadata.metricsCount);

// handle the promise
promise
  .then((results) => {
    console.log("Metrics", results.getMetrics());
    //console.log('Offenders', results.getAllOffenders());
    console.log("Number of requests: %d", results.getMetric("requests"));
    console.log("Failed asserts: %j", results.getFailedAsserts());
  })
  .catch((ex) => {
    throw ex;
  });

// events handling
//promise.on('init', (browser, page) => console.log('Init', browser, page));

promise.on("milestone", (milestone) => {
  console.log("Milestone reached: %s", milestone);
});

promise.on("recv", (response) => {
  console.log(
    "Response: %s %s [%s %s]",
    response.method,
    response.url,
    response.contentType,
    response.httpVersion,
  );
});

// including the custom once emitted by phantomas modules
promise.on("domQuery", (type, query) => {
  console.log('DOM query by %s - "%s"', type, query);
});
