/**
 * Analyzes number of requests and sizes of different types of assets
 *
 * setMetric('htmlCount') @desc number of HTML responses @offenders
 * setMetric('htmlSize')  @desc size of HTML responses
 * setMetric('cssCount') @desc number of CSS responses @offenders
 * setMetric('cssSize')  @desc size of CSS responses
 * setMetric('jsCount') @desc number of JS responses @offenders
 * setMetric('jsSize')  @desc size of JS responses
 * setMetric('jsonCount') @desc number of JSON responses @offenders
 * setMetric('jsonSize')  @desc size of JSON responses
 * setMetric('imageCount') @desc number of image responses @offenders
 * setMetric('imageSize')  @desc size of image responses
 * setMetric('webfontCount') @desc number of web font responses @offenders
 * setMetric('webfontSize')  @desc size of web font responses
 * setMetric('videoCount') @desc number of video responses @offenders
 * setMetric('videoSize')  @desc size of video responses
 * setMetric('base64Count') @desc number of base64 encoded "responses" (no HTTP request was actually made) @offenders
 * setMetric('base64Size')  @desc size of base64 encoded responses
 * setMetric('otherCount') @desc number of other responses @offenders
 * setMetric('otherSize')  @desc size of other responses
 */
'use strict';

module.exports = function(phantomas) {
	['html', 'css', 'js', 'json', 'image', 'video', 'webfont', 'base64', 'other'].forEach(function(key) {
		phantomas.setMetric(key + 'Count');
		phantomas.setMetric(key + 'Size');
	});

	phantomas.on('recv', function(entry, res) {
		var size = entry.bodySize;

		phantomas.incrMetric(entry.type + 'Count');
		phantomas.incrMetric(entry.type + 'Size', size);

		phantomas.addOffender(entry.type + 'Count', entry.url + ' (size: ' + (size / 1024).toFixed(2) + ' kB, latency: ' + entry.timeToFirstByte + ' ms)');
	});

	phantomas.on('base64recv', function(entry, res) {
		phantomas.incrMetric('base64Count');
		phantomas.incrMetric('base64Size', entry.contentLength);
	});
};
