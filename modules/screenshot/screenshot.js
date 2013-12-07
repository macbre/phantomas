/**
 * Renders a screenshot of the page when it's fully loaded
 *
 * @see http://phantomjs.org/api/webpage/method/render.html
 */
exports.version = '0.1';

exports.module = function(phantomas) {
	var param = phantomas.getParam('screenshot'),
		path = '';

	if (typeof param === 'undefined') {
		return;
	}

	// --screenshot
	if (param === true) {
		// defaults to "2013-12-07T20:15:01.521Z.png"
		path = (new Date()).toJSON() + '.png';
	}
	// --screenshot [file name]
	else {
		path = param;
	}

	phantomas.on('report', function() {
		var then = Date.now();
		phantomas.render(path);

		phantomas.log('Screenshot: rendered to %s in %d ms', path, Date.now() - then);
	});
};
