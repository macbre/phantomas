/**
 * Renders a serie of screenshots of page being loaded
 *
 * Please note that rendering each screenshot takes
 * several hundreds ms. Consider increasing default timeout.
 *
 * Run phantomas with --film-strip option to use this module
 */
exports.version = '0.1';

exports.module = function(phantomas) {
	if (!phantomas.getParam('film-strip')) {
		phantomas.log('To enable screenshots of page being loaded run phantomas with --film-strip option');
		return;
	}

	var filmStripOutputDir = 'filmstrip';
	// grab output dir from args
	if (phantomas.getParam('film-strip-dir')) {
		filmStripOutputDir = phantomas.getParam('film-strip-dir').replace(/\/+$/,'');
	}


	var zoomFactor = 0.5;
	phantomas.setZoom(zoomFactor);

	var util = phantomas.require('util'),
		fs = require('fs'),
		// throttling
		SCREENSHOTS_MIN_INTERVAL = 75,
		lastScreenshot = 0,
		start = Date.now(),
		// stats
		timeTotal = 0,
		screenshots = [];

	function screenshot() {
		var now = Date.now(),
			path,
			ts;

		// check when was the last screenshot taken (exclude time it took to render the screenshot)
		if (now - lastScreenshot < SCREENSHOTS_MIN_INTERVAL) {
			//phantomas.log('Film strip: skipped');
			return;
		}

		// time offset excluding time it took to render screenshots
		ts = now - start - timeTotal;
		path = util.format(filmStripOutputDir+'/screenshot-%d-%d.png', start, ts);

		phantomas.render(path);
		lastScreenshot = Date.now();

		// verify that the screnshot was really taken
		if (fs.isReadable(path)) {
			phantomas.log('Film strip: rendered to %s in %d ms', path, Date.now() - now);

			screenshots.push({
				path: path,
				ts: ts
			});

			// stats
			timeTotal += (Date.now() - now);
		}
		else {
			phantomas.log('Film strip: rendering to %s failed!', path);
		}
	}

	// bind to events to render screenshots on
	[
		'loadStarted',
		'send',
		'recv',
		'loadFinished',
		'report'
	].forEach(function(ev) {
		phantomas.on(ev, screenshot);
	});

	// print-out stats
	phantomas.on('report', function() {
		phantomas.log('Film strip: spent %d ms on rendering %d screenshots', timeTotal, screenshots.length);

		// TODO: generate a movie
	});
};
