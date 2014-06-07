/**
 * Defines SlimerJS engine
 */
var pkg = require('slimerjs');

module.exports = {
	name: 'SlimerJS',
	engine: 'gecko',
	path: pkg.path,
	version: pkg.version,
	getUserAgent: function() {
		return 'SlimerJS/' + pkg.version
	}
};
