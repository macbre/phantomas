/**
 * Defines SlimerJS engine
 */
var pkg = require('slimerjs'),
	debug = require('debug')('phantomas:slimerjs'),
	spawn = require('child_process').spawn;

module.exports = {
	name: 'SlimerJS',
	engine: 'gecko',
	path: pkg.path,
	version: pkg.version,
	getUserAgent: function() {
		return 'SlimerJS/' + pkg.version
	},
	spawn: function(path, engineArgs) {
		// xvfb arguments
		var args = [
			'--auto-servernum',
			'--server-num=1',
			//'--server-args=\':1 -noreset -screen 1 1600x1200x24\''
		];

		// SlimerJS binary
		args.push(path);

		// filter out --ssl-protocol option
		// supoorted by PhantomJS, but not by SlimerJS
		engineArgs = engineArgs.filter(function(opt) {
			return (opt.indexOf('--ssl-protocol=') === 0) ? false /* remove */ : true;
		});

		// pass runner and phantomas options
		args = args.concat(engineArgs);

		debug('xvfb-run %s', args.join(' '));

		// spawn SlimerJS using xvfb
		//
		// sudo aptitude install xvfb libasound2 libgtk2.0-0
		//
		// @see https://gist.github.com/macbre/e7e2e35caf9d91af5ecf
		return spawn('xvfb-run', args, {
			env: process.env
		});
	}
};
