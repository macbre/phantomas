/**
 * Renders a serie of screenshots of page being loaded
 *
 * Please note that rendering each screenshot takes
 * several hundreds ms. Consider increasing default timeout.
 *
 * Run phantomas with --film-strip option to use this module
 *
 * --film-strip-dir folder path to output film strip (default is ./filmstrip directory)
 * --film-strip-prefix film strip files name prefix (defaults to 'screenshot')
 */
'use strict';

exports.version = '0.2';

exports.module = function(phantomas) {
	if (!phantomas.getParam('film-strip')) {
		phantomas.log('filmStrip: to enable screenshots of page being loaded run phantomas with --film-strip option');
		return;
	}

	var filmStripOutputDir = phantomas.getParam('film-strip-dir', 'filmstrip', 'string').replace(/\/+$/,''),
		filmStripPrefix = phantomas.getParam('film-strip-prefix', 'screenshot', 'string').replace(/[^a-z0-9\-]+/ig,'-');

	var zoomFactor = 0.5;
	phantomas.setZoom(zoomFactor);

	phantomas.log('filmStrip: film strip will be stored as %s/%s-*.png files (zoom: %d)', filmStripOutputDir, filmStripPrefix, zoomFactor);

	var util = phantomas.require('util'),
		fs = require('fs'),
		// throttling
		SCREENSHOTS_MIN_INTERVAL = 75,
		lastScreenshot = 0,
		start = Date.now(),
		startFormatted = (new Date()).toJSON().substr(0,19), // 2014-05-18T13:08:13
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
		path = util.format('%s/%s-%s-%d.png', filmStripOutputDir, filmStripPrefix, startFormatted, ts);

		phantomas.render(path);
		lastScreenshot = Date.now();

		// verify that the screnshot was really taken
		if (fs.isReadable(path)) {
			phantomas.log('Film strip: rendered to %s in %d ms', path, Date.now() - now);
			phantomas.emit('filmStrip', path, ts);

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
