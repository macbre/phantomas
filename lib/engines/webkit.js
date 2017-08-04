/**
 * Defines PhantomJS 2.x engine
 *
 * @see https://github.com/macbre/phantomas/issues/488
 */
var pkg = require('phantomjs-prebuilt');

module.exports = {
	name: 'PhantomJS',
	engine: 'webkit',
	path: pkg.path,
	version: pkg.version,
	getUserAgent: function() {
		return 'PhantomJS/' + pkg.version
	},
	getEngineArgs: function() {
		return [
			// enable local storage in PhantomJS 2.5 (#710)
			'--local-storage-quota=5000',
		];
	}
};
