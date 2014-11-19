/**
 * Log requests for build HAR output
 *
 * Depends on windowPerformance module!
 *
 * @see: https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/HAR/Overview.html
 */
'use strict';

exports.version = '0.1';

var fs = require('fs');

/**
 * Inspired by phantomHAR
 * @author: Christopher Van (@cvan)
 * @homepage: https://github.com/cvan/phantomHAR
 * @original: https://github.com/cvan/phantomHAR/blob/master/phantomhar.js
 */

function createHAR(page, creator) {
		var address = page.address;
		var title = page.title;
		var startTime = page.startTime;
		var resources = page.resources;

		var entries = [];

		resources.forEach(function(resource) {
			var request = resource.request;
			var response = resource.response;
			var entry = resource.entry;

			if (!request || !response || !entry) {
				return;
			}

			// Exclude data URIs from the HAR because they aren't
			// included in the spec.
			if (request.url.substring(0, 5).toLowerCase() === 'data:') {
				return;
			}

			entries.push({
				cache: {},
				pageref: address,
				request: {
					// Accurate bodySize blocked on https://github.com/ariya/phantomjs/pull/11484
					bodySize: -1,
					cookies: [],
					headers: request.headers,
					// Accurate headersSize blocked on https://github.com/ariya/phantomjs/pull/11484
					headersSize: -1,
					httpVersion: 'HTTP/1.1',
					method: request.method,
					queryString: [],
					url: request.url,
				},
				response: {
					bodySize: entry.contentLength,
					cookies: [],
					headers: response.headers,
					headersSize: -1,
					httpVersion: 'HTTP/1.1',
					redirectURL: '',
					status: entry.status,
					statusText: entry.statusText,
					content: {
						mimeType: entry.contentType || '',
						size: entry.bodySize, // uncompressed
						text: entry.content || ''
					}
				},
				startedDateTime: entry.sendTime.toISOString(),
				time: entry.timeToLastByte,
				timings: {
					blocked: 0,
					dns: -1,
					connect: -1,
					send: 0,
					wait: entry.timeToFirstByte || 0,
					receive: entry.receiveTime,
					ssl: -1
				}
			});
		});

		return {
			log: {
				creator: creator,
				entries: entries,
				pages: [
					{
						startedDateTime: startTime.toISOString(),
						id: address,
						title: title,
						pageTimings: {
							onLoad: page.onLoad || -1,
							onContentLoad: page.onContentLoad || -1
						}
                }
            ],
				version: '1.2',
			}
		};
	}
	/** End **/

exports.module = function(phantomas) {

	var param = phantomas.getParam('har'),
		path = '';

	var page = {
		origin: undefined,
		resources: [],
		title: undefined,
		address: undefined,
		startTime: undefined,
		endTime: undefined,
		onDOMReadyTime: undefined,
		windowOnLoadTime: undefined,
		timeToLastByte: undefined,
		onLoad: undefined,
		onContentLoad: undefined
	};

	var creator = {
		name: "Phantomas - (using phantomHAR)",
		version: phantomas.getVersion()
	};

	if (typeof param === 'undefined') {
		phantomas.log('HAR: no path specified, use --har <path>');
		return;
	}

	// --har
	if (param === true) {
		// defaults to "2013-12-07T20:15:01.521Z.har"
		path = (new Date()).toJSON() + '.har';
	}
	// --har [file name]
	else {
		path = param;
	}

	phantomas.log('HAR: will be stored in %s', path);

	phantomas.on('pageBeforeOpen', function(p) {
		page.origin = p;
	});

	phantomas.on('pageOpen', function() {
		page.startTime = new Date();
	});

	phantomas.on('loadFinished', function() {
		page.endTime = new Date();
	});

	phantomas.on('send', function(entry, res) {
		page.resources[res.id] = {
			request: res,
			response: null,
			entry: null
		};
	});

	phantomas.on('recv', function(entry, res) {
		page.resources[res.id].response = res;
		page.resources[res.id].entry = entry;
	});

	phantomas.on('metric', function(name, value) {
		switch (name) {
			case 'domContentLoaded':
				page.onDOMReadyTime = value;
				break;
			case 'domComplete':
				page.windowOnLoadTime = value;
				break;
			case 'timeToLastByte':
				page.timeToLastByte = value;
				break;
		}
	});

	phantomas.on('report', function() {
		// Set endTime if page was not finished correctly
		if (!page.endTime)
			page.endTime = new Date();

		// If metric 'windowOnLoadTime' hasn't been fired, compute it
		if (!page.windowOnLoadTime)
			page.windowOnLoadTime = page.endTime.getTime() - page.startTime.getTime();

		page.address = page.origin.url;
		page.title = page.origin.title;

		// Times (windowOnLoadTime, onDOMReadyTime) are relative to responseEnd entry
		// in NavigationTiming (represented by timeToLastByte metric)
		page.onLoad = page.timeToLastByte + page.windowOnLoadTime;
		page.onContentLoad = page.timeToLastByte + page.onDOMReadyTime;

		phantomas.log('HAR: generating for <%s> ("%s")', page.address, page.title);

		var har,
			dump;

		try {
			har = createHAR(page, creator);
		} catch (e) {
			phantomas.log('HAR: failed to build - %s', e);
			return;
		}

		try {
			dump = JSON.stringify(har);
		} catch (e) {
			phantomas.log('HAR: failed to stringify HAR to JSON - %s!', e);
			return;
		}

		phantomas.log("HAR: saving to '%s',,,", path);
		try {
			fs.write(path, dump);
		} catch (e) {
			phantomas.log('HAR: failed to save HAR - %s!', e);
			return;
		}

		phantomas.log('HAR: done');
	});
};
