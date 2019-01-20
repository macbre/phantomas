/**
 * Analyzes number of requests and sizes of different types of assets
 *
 * setMetric('htmlCount') @desc number of HTML responses @offenders
 * setMetric('htmlSize')  @desc size of HTML responses (with compression)
 * setMetric('cssCount') @desc number of CSS responses @offenders
 * setMetric('cssSize')  @desc size of CSS responses (with compression)
 * setMetric('jsCount') @desc number of JS responses @offenders
 * setMetric('jsSize')  @desc size of JS responses (with compression)
 * setMetric('jsonCount') @desc number of JSON responses @offenders
 * setMetric('jsonSize')  @desc size of JSON responses (with compression)
 * setMetric('imageCount') @desc number of image responses @offenders
 * setMetric('imageSize')  @desc size of image responses (with compression)
 * setMetric('webfontCount') @desc number of web font responses @offenders
 * setMetric('webfontSize')  @desc size of web font responses (with compression)
 * setMetric('videoCount') @desc number of video responses @offenders
 * setMetric('videoSize')  @desc size of video responses (with compression)
 * setMetric('base64Count') @desc number of base64 encoded "responses" (no HTTP request was actually made) @offenders
 * setMetric('base64Size')  @desc size of base64 encoded responses
 * setMetric('otherCount') @desc number of other responses @offenders
 * setMetric('otherSize')  @desc size of other responses (with compression)
 */
'use strict';

module.exports = (phantomas) => {
	['html', 'css', 'js', 'json', 'image', 'video', 'webfont', 'base64', 'other'].forEach(key => {
		phantomas.setMetric(key + 'Count');
		phantomas.setMetric(key + 'Size');
	});

	phantomas.on('recv', entry => {
		var size = entry.transferedSize;

		phantomas.incrMetric(entry.type + 'Count');
		phantomas.incrMetric(entry.type + 'Size', size);

		phantomas.addOffender(entry.type + 'Count', {
			url: entry.url,
			size: size,
			latency: entry.timeToFirstByte
		});
	});

	phantomas.on('base64recv', entry => {
		phantomas.incrMetric('base64Count');
		phantomas.incrMetric('base64Size', entry.bodySize);
	});
};
