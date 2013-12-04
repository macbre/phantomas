#!/usr/bin/env node

var path    = require('path'),
	spawn = require('child_process').spawn,
	phantomjs = require('phantomjs');

var phantomas = spawn(phantomjs.path, [path.resolve(__dirname, 'phantomjs/phantomas.js')].concat(process.argv.slice(2)));

phantomas.stdout.pipe(process.stdout);
phantomas.stderr.pipe(process.stderr);

phantomas.on('close', function (code) {
	process.exit(code);
});