/**
 * Defines PhantomJS 2.x engine
 *
 * @see https://github.com/macbre/phantomas/pull/531
 */
var pkg = require('phantomjs2');

module.exports = {
	name: 'PhantomJS',
	engine: 'webkit2',
	path: pkg.path,
	version: pkg.version,
	getUserAgent: function() {
		return 'PhantomJS/' + pkg.version
	}
};
