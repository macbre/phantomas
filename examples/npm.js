#!/usr/bin/env node

/**
 * Example script that uses phantomas npm module
 */
var phantomas = require('../'),
	run;

console.log('phantomas v%s loaded from %s', phantomas.version, phantomas.path);

run = phantomas('http://google.is', {
	'analyze-css': true,
	'assert-requests': 1
});

console.log('Running phantomas: pid %d', run.pid);

// metrics metadata
console.log('Number of available metrics: %d', phantomas.metadata.metricsCount);

// errors handling
run.on('error', function(code) {
	console.log('Exit code #%d', code);
});

// handle results
run.on('results', function(results) {
	console.log('Number of requests: %d', results.getMetric('requests'));
	console.log('Failed asserts: %j', results.getFailedAsserts());
});

// events handling
run.on('progress', function(progress) {
	console.log('Loading progress: %d%', progress);
});

run.on('milestone', function(milestone, timing) {
	console.log('%s at %d ms', milestone, timing);
});
