/**
 * Defines PhantomJS engine
 */
var pkg = require('phantomjs');

module.exports = {
	name: 'PhantomJS',
	engine: 'webkit',
	path: pkg.path,
	version: pkg.version,
	getUserAgent: function() {
		return 'PhantomJS/' + pkg.version
	}
};
