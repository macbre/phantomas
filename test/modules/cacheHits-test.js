/**
 * Test cacheHits module
 */
var vows = require('vows'),
	assert = require('assert'),
	mock = require('./mock');

vows.describe('cacheHits').
addBatch({
	'no caching headers': mock.getContext('cacheHits', function(phantomas) {
		return phantomas.recv({
			headers: {}
		}).report();
	}, {
		'cacheHits': 0,
		'cacheMisses': 0,
		'cachePasses': 0
	}),
	'Age header (hit)': mock.getContext('cacheHits', function(phantomas) {
		return phantomas.recv({
			headers: {
				'Age': '14365'
			}
		}).report();
	}, {
		'cacheHits': 1,
		'cacheMisses': 0,
		'cachePasses': 0
	}),
	'Age + X-Cache header (hit)': mock.getContext('cacheHits', function(phantomas) {
		return phantomas.recv({
			headers: {
				'Age': '14365',
				'X-Cache': 'HIT'
			}
		}).report();
	}, {
		'cacheHits': 1,
		'cacheMisses': 0,
		'cachePasses': 0
	}),
	'Age header (0 seconds)': mock.getContext('cacheHits', function(phantomas) {
		return phantomas.recv({
			headers: {
				'Age': '0'
			}
		}).report();
	}, {
		'cacheHits': 0,
		'cacheMisses': 1,
		'cachePasses': 0
	}),
	'hits': mock.getContext('cacheHits', function(phantomas) {
		return phantomas.recv({
			headers: {
				'X-Cache': 'HIT'
			}
		}).report();
	}, {
		'cacheHits': 1,
		'cacheMisses': 0,
		'cachePasses': 0
	}),
	'hits (following the miss)': mock.getContext('cacheHits', function(phantomas) {
		return phantomas.recv({
			headers: {
				'X-Cache': 'HIT, MISS'
			}
		}).report();
	}, {
		'cacheHits': 1,
		'cacheMisses': 0,
		'cachePasses': 0
	}),
	'misses': mock.getContext('cacheHits', function(phantomas) {
		return phantomas.recv({
			headers: {
				'X-Cache': 'MISS'
			}
		}).report();
	}, {
		'cacheHits': 0,
		'cacheMisses': 1,
		'cachePasses': 0
	}),
	'passes': mock.getContext('cacheHits', function(phantomas) {
		return phantomas.recv({
			headers: {
				'X-Cache': 'PASS'
			}
		}).report();
	}, {
		'cacheHits': 0,
		'cacheMisses': 0,
		'cachePasses': 1
	}),
}).
export(module);
