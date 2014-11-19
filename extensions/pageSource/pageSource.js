/**
 * Saves the souce of page being loaded to a file
 *
 * Please note that saving each file takes a few ms.
 * Consider increasing default timeout.
 *
 * Run phantomas with --page-source option to use this module
 */
'use strict';

exports.version = '0.1';

exports.module = function(phantomas) {
	if (!phantomas.getParam('page-source')) {
		phantomas.log('To enable page-source of page being loaded run phantomas with --page-source option');
		return;
	}

	var util = phantomas.require('util'),
		fs = require('fs'),
		pageSourceOutputDir = 'html';

	// grab output dir from args
	if (phantomas.getParam('page-source-dir')) {
		pageSourceOutputDir = phantomas.getParam('page-source-dir').replace(/\/+$/, '');
	}

	// save source data
	phantomas.on('report', function() {
		var now = Date.now(),
			path = util.format(pageSourceOutputDir + '/%d.html', now);

		fs.write(path, phantomas.getSource(), 'w');

		// verify that the file was really written
		if (fs.isReadable(path)) {
			phantomas.log('Page source: saved to %s in %d ms', path, Date.now() - now);
		} else {
			phantomas.log('Page source: saved to %s failed!', path);
		}
	});
};
