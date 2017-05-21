/**
 * Test caching module
 */
var vows = require('vows'),
	assert = require('assert'),
	mock = require('./mock');

vows.describe('caching').
addBatch({
	'caching not specified': mock.getContext('caching', function(phantomas) {
		return phantomas.recv({
			isImage: true,
			headers: {
				'X-Foo': 'Bar'
			}
		}).report();
	}, {
		'cachingNotSpecified': 1
	}),
	'old caching header used (Expires)': mock.getContext('caching', function(phantomas) {
		return phantomas.recv({
			isImage: true,
			headers: {
				'Expires': 'Wed, 21 Oct 2015 07:28:00 GMT'
			}
		}).report();
	}, {
		'oldCachingHeaders': 1,
		'cachingNotSpecified': 0,
		'cachingDisabled': 1,
	}),
	'old caching header used (Pragma)': mock.getContext('caching', function(phantomas) {
		return phantomas.recv({
			isImage: true,
			headers: {
				'Pragma': 'no-cache'
			}
		}).report();
	}, {
		'oldCachingHeaders': 1,
		'cachingNotSpecified': 1
	}),
	'caching too short': mock.getContext('caching', function(phantomas) {
		return phantomas.recv({
			isImage: true,
			headers: {
				'Cache-Control': 'max-age=600'
			}
		}).report();
	}, {
		'cachingTooShort': 1,
		'cachingUseImmutable': 0,
	}),
	'caching not too short (but without immutable)': mock.getContext('caching', function(phantomas) {
		return phantomas.recv({
			isImage: true,
			headers: {
				'Cache-Control': 'max-age=2592000' // 30 days
			}
		}).report();
	}, {
		'cachingTooShort': 0,
		'cachingUseImmutable': 1,
	}),
	'caching not too short (and use immutable)': mock.getContext('caching', function(phantomas) {
		return phantomas.recv({
			isImage: true,
			headers: {
				'Cache-Control': 'max-age=2592000, immutable' // 30 days
			}
		}).report();
	}, {
		'cachingTooShort': 0,
		'cachingUseImmutable': 0,
	}),
}).
export(module);
