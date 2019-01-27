/**
 * Saves the source of page being loaded to a file
 *
 * Please note that saving each file takes a few ms.
 * Consider increasing default timeout.
 *
 * Run phantomas with --page-source option to use this module.
 */
'use strict';

module.exports = phantomas => {
	if (!phantomas.getParam('page-source')) {
		phantomas.log('To enable page-source of page being loaded run phantomas with --page-source option');
		return;
	}

	const fs = require('fs'),
		format = require('util').format,
		workingDirectory = require('process').cwd(),
		// grab output dir from argument, defaults to working directory
		pageSourceOutputDir = phantomas.getParam('page-source-dir', workingDirectory).replace(/\/+$/, ''),
		path = format('%s/phantomas_%d.html', pageSourceOutputDir, Date.now());

	phantomas.log('Will store page source in %s', path);

	// https://github.com/GoogleChrome/puppeteer/blob/v1.11.0/docs/api.md#pageevaluatepagefunction-args
	phantomas.awaitBeforeClose(function waitForEvent(page) {
		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
		return new Promise(async resolve => {
			// https://github.com/GoogleChrome/puppeteer/blob/v1.11.0/docs/api.md#pageevaluatepagefunction-args
			const bodyHandle = await page.$('body');
			const html = await page.evaluate(body => body.innerHTML, bodyHandle);

			// phantomas.log(html);
			fs.writeFileSync(path, html);

			phantomas.log('Page source stored in %s', path);

			// let clients know that we stored the page source in a file
			phantomas.emit('pageSource', path);
			resolve();
		});
	});
};
