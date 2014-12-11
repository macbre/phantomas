/**
 * Renders a screenshot of the page when it's fully loaded
 *
 * @see http://phantomjs.org/api/webpage/method/render.html
 */
'use strict';

exports.version = '0.2';

exports.module = function(phantomas) {
	var param = phantomas.getParam('screenshot'),
		path = '';

	if (typeof param === 'undefined') {
		phantomas.log('Screenshot: to enable screenshot of the fully loaded page run phantomas with --screenshot option');
		return;
	}

	// --screenshot
	if (param === true) {
		// defaults to "2013-12-07T20:15:01.521Z.png"
		path = (new Date()).toJSON().
		replace(/:/g, '-'); // be M$ Windows compatible (issue #454)

		path += '.png';
	}
	// --screenshot [file name]
	else {
		path = param;
	}

	phantomas.on('report', function() {
		var then = Date.now(),
			time;

		phantomas.render(path);

		time = Date.now() - then;

		phantomas.log('Screenshot: rendered to %s in %d ms', path, time);
		phantomas.emit('screenshot', path, time);
	});
};
