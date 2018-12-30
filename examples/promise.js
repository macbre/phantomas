#!/usr/bin/env node

/**
 * Example script that uses phantomas npm module with promise pattern
 */
const phantomas = require('..');

console.log('phantomas v%s loaded from %s', phantomas.version, phantomas.path);

const promise = phantomas('http://0.0.0.0', {
	'analyze-css': true,
	'assert-requests': 1
});

//console.log('Results: %s', promise);

// metrics metadata
//console.log('Number of available metrics: %d', phantomas.metadata.metricsCount);

// handle the promise
promise.
	then(results => {
		console.log('Metrics', results.getMetrics());
		console.log('Offenders', results.getAllOffenders());
		console.log('Number of requests: %d', results.getMetric('requests'));
		console.log('Failed asserts: %j', results.getFailedAsserts());
	}).
	catch(res => {
		console.error(res);
		console.log('Error code #%d', res.code);
		process.exit(res.code);
	});

// events handling
//promise.on('init', (browser, page) => console.log('Init', browser, page));

promise.on('milestone', milestone => {
	console.log('Milestone reached: %s', milestone);
});

promise.on('recv', response => {
	console.log('Response: %s %s [%s]', response.method, response.url, response.contentType);
});

// including the custom once emitted by phantomas modules
promise.on('domQuery', (type, query) => {
	console.log('DOM query by %s - "%s"', type, query);
});
