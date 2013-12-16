#!/usr/bin/env node
var phantomas = require('./index'),
	child;

var url = 'http://example.com';

child = phantomas(url, {verbose: true}, function(err, res) {
	if (err) {
		console.log('err #' + err);
		process.exit(err);
	}

	console.log(res);
});

// emit --verbose messages
child.stderr.pipe(process.stderr);

child.on('results', function (res) {
	console.log(res);
});

/**
child.on('data', function (data) {
	console.log(data);
});

child.on('error', function (code) {
	console.log(code);
	process.exit(code);
});
/**/
