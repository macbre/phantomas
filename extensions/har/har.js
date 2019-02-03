/**
 * Log requests for build HAR output
 *
 * Depends on windowPerformance module!
 */
'use strict';

var fs = require('fs');

/**
 * Inspired by phantomHAR
 * @author: Christopher Van (@cvan)
 * @homepage: https://github.com/cvan/phantomHAR
 * @original: https://github.com/cvan/phantomHAR/blob/master/phantomhar.js
 */

function createHAR(page, creator) {
	// @see: https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/HAR/Overview.html
	var address = page.address;
	var title = page.title;
	var startTime = page.startTime;
	var resources = page.resources;

	var entries = [];

	resources.forEach(function(resource) {
		var request = resource.request;
		var response = resource.response;

		if (!request || !response) {
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
				bodySize: response.bodySize,
				cookies: [],
				headers: response.headers,
				headersSize: response.headersSize,
				httpVersion: 'HTTP/1.1',
				redirectURL: '',
				status: response.status,
				statusText: response.statusText,
				content: {
					mimeType: response.contentType || '',
					size: response.bodySize, // uncompressed
					text: ''
				}
			},
			startedDateTime: resource.startTime && resource.startTime.toISOString(),
			time: response.timeToLastByte,
			timings: {
				blocked: 0,
				dns: -1,
				connect: -1,
				send: 0,
				wait: 0, // response.timeToFirstByte || 0,
				receive: 0, // response.receiveTime,
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

module.exports = function(phantomas) {

	var param = phantomas.getParam('har'),
		path = '',
		timeToLastByte;

	if (param === false) {
		return;
	}

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
		// defaults to "phantomas_2013-12-07T20:15:01.521Z.har"
		path = 'phantomas_' + (new Date()).toJSON() + '.har';
	}
	// --har [file name]
	else {
		path = param;
	}

	phantomas.log('Will be stored in %s', path);

	phantomas.on('pageBeforeOpen', function(p) {
		page.origin = p;
	});

	phantomas.on('loadFinished', function() {
		page.endTime = new Date();
	});

	phantomas.on('send', entry => {
		const resId = entry._requestId;

		page.resources[resId] = {
			id: resId,
			request: entry,
			response: null,
			startTime: new Date(),
		};

		// a first request has been made?
		if (typeof page.startTime === 'undefined') {
			page.startTime = new Date();
		}
	});

	phantomas.on('recv', entry => {
		const resId = entry.id;

		page.resources[resId].response = entry;
		timeToLastByte = entry.timeToLastByte;
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

	phantomas.on('report', () => {
		// make resources list a real array
		page.resources = Object.values(page.resources);

		// Set endTime if page was not finished correctly
		if (!page.endTime)
			page.endTime = new Date();

		// If metric 'windowOnLoadTime' hasn't been fired, compute it
		//if (!page.windowOnLoadTime)
		//	page.windowOnLoadTime = page.endTime.getTime() - page.startTime.getTime();

		// If metric 'timeToLastByte' hasn't been fired, use last entry
		if (!page.timeToLastByte)
			page.timeToLastByte = timeToLastByte;

		//page.address = page.origin.url;
		//page.title = page.origin.title;

		// Times (windowOnLoadTime, onDOMReadyTime) are relative to responseEnd entry
		// in NavigationTiming (represented by timeToLastByte metric)
		page.onLoad = page.timeToLastByte + page.windowOnLoadTime;
		page.onContentLoad = page.timeToLastByte + page.onDOMReadyTime;

		phantomas.log('Generating for <%s> ("%s")', page.address, page.title);
		phantomas.log('Page data: %j', page);

		var har,
			dump;

		try {
			har = createHAR(page, creator);
		} catch (e) {
			console.error(e);
			phantomas.log('Failed to build - %s', e);
			return;
		}

		phantomas.log('Result: %j', har);

		try {
			dump = JSON.stringify(har);
		} catch (e) {
			console.error(e);
			phantomas.log('Failed to stringify HAR to JSON - %s!', e);
			return;
		}

		phantomas.log("Saving to %s ...", path);
		try {
			// https://nodejs.org/api/fs.html#fs_fs_writefilesync_file_data_options
			fs.writeFileSync(path, dump);
		} catch (e) {
			console.error(e);
			phantomas.log('Failed to save HAR - %s!', e);
			return;
		}

		// let clients know that we save a HAR file
		phantomas.emit('har', path);
		phantomas.log('Done');
	});
};
