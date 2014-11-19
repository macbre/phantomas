#!/usr/bin/env node

/**
 * Example script that uses phantomas npm module with promise pattern
 */
var phantomas = require('..'),
	run;

console.log('phantomas v%s loaded from %s', phantomas.version, phantomas.path);

run = phantomas('http://google.is', {
	'analyze-css': true,
	'assert-requests': 1
});

console.log('Running phantomas: pid %d', run.pid);

// metrics metadata
console.log('Number of available metrics: %d', phantomas.metadata.metricsCount);

// handle the promise
run.
then(function(res) {
	console.log('Exit code: %d', res.code);
	console.log('Number of requests: %d', res.results.getMetric('requests'));
	console.log('Failed asserts: %j', res.results.getFailedAsserts());
}).
fail(function(code) {
	console.log('Exit code #%d', code);
	process.exit(code);
}).
progress(function(progress) {
	console.log('Loading progress: %d%', progress * 100);
}).
done();

// events handling
run.on('milestone', function(milestone, timing) {
	console.log('%s at %d ms', milestone, timing);
});

// including the custom once emitted by phantomas modules
run.on('domQuery', function(type, query) {
	console.log('DOM query by %s - "%s"', type, query);
});
