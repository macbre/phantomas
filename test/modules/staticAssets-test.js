/**
 * Test staticAssets module
 */
var vows = require('vows'),
	assert = require('assert'),
	mock = require('./mock');

var URL = 'http://example.com/';

vows.describe('staticAssets').
addBatch({
	'no-op': mock.getContext('staticAssets', function(phantomas) {
		return phantomas.recvRequest().report();
	}, {
		'assetsNotGzipped': 0,
		'assetsWithQueryString': 0,
		'assetsWithCookies': 0,
		'smallImages': 0,
		'smallCssFiles': 0,
		'smallJsFiles': 0,
		'multipleRequests': 0
	}),
	'no gzip': mock.getContext('staticAssets', function(phantomas) {
		return phantomas.recv({
			url: URL,
			status: 200,
			isCSS: true,
			type: 'css'
		}).report();
	}, {
		'assetsNotGzipped': 1,
	}),
	'with query string': mock.getContext('staticAssets', function(phantomas) {
		return phantomas.recv({
			url: URL + '?foo=bar',
			status: 200,
			isCSS: true,
			type: 'css'
		}).report();
	}, {
		'assetsWithQueryString': 1,
	}),
	'with cookies': mock.getContext('staticAssets', function(phantomas) {
		return phantomas.recv({
			url: URL,
			status: 200,
			isCSS: true,
			type: 'css',
			hasCookies: true
		}).report();
	}, {
		'assetsWithCookies': 1,
	}),
	'multiple requests': mock.getContext('staticAssets', function(phantomas) {
		var entry = {
			url: URL,
			status: 200,
			isCSS: true,
			type: 'css'
		};

		return phantomas.recv(entry).recv(entry).recv(entry).report();
	}, {
		'multipleRequests': 1, // one assets loaded multiple times
	}),
	'normal images': mock.getContext('staticAssets', function(phantomas) {
		return phantomas.recv({
			url: URL,
			status: 200,
			isImage: true,
			type: 'image',
			contentLength: 32 * 1024
		}).report();
	}, {
		'smallImages': 0,
	}),
	'small images': mock.getContext('staticAssets', function(phantomas) {
		return phantomas.recv({
			url: URL,
			status: 200,
			isImage: true,
			type: 'image',
			contentLength: 1024
		}).report();
	}, {
		'smallImages': 1,
	}),
	'small CSS': mock.getContext('staticAssets', function(phantomas) {
		return phantomas.recv({
			url: URL,
			status: 200,
			isCSS: true,
			type: 'css',
			contentLength: 1024
		}).report();
	}, {
		'smallCssFiles': 1,
	}),
	'small JS': mock.getContext('staticAssets', function(phantomas) {
		return phantomas.recv({
			url: URL,
			status: 200,
			isJS: true,
			type: 'js',
			contentLength: 1024
		}).report();
	}, {
		'smallJsFiles': 1,
	}),
}).
export(module);
