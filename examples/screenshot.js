#!/usr/bin/env node

/**
 * Example script that uses phantomas npm module
 * to render a screenshot of a given webpage
 *
 * USAGE:
 *
 * ./screenshot.js <URL>
 */
var phantomas = require('..'),
	run,
	url = process.argv[2];

if (typeof url !== 'string') {
	console.log('Usage:\n\t./screenshot.js <URL>');
	process.exit(1);
}

run = phantomas(url, {
	'screenshot': true
		//'screenshot': __dirname + '/screenshot.png'
});

// handle the promise
run.
then(function(res) {
	console.log('Done with exit code: %d', res.code);
}).
fail(function(code) {
	console.log('Exit code #%d', code);
	process.exit(code);
}).
progress(function(progress) {
	console.log('Loading progress: %d%', progress * 100);
}).
done();

run.on('screenshot', function(path, time) {
	console.log('Screenshot saved to %s (rendered in %d ms)', path, time);
});
