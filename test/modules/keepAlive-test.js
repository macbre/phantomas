/**
 * Test cacheHits module
 */
var vows = require('vows'),
	assert = require('assert'),
	mock = require('./mock');

vows.describe('keepAlive').
addBatch({
	'connection closed, no more requests': mock.getContext('keepAlive', function(phantomas) {
		return phantomas.recv({
			protocol: 'http',
			domain: 'foo.net',
			url: 'http://foo.net/',
			headers: {
				'Connection': 'close'
			}
		}).send({
			protocol: 'http',
			domain: 'foo.bar'
		}).report();
	}, {
		'closedConnections': 0
	}),
	'connection closed, more requests': mock.getContext('keepAlive', function(phantomas) {
		return phantomas.recv({
			protocol: 'http',
			domain: 'foo.net',
			url: 'http://foo.net/',
			headers: {
				'Connection': 'close'
			}
		}).send({
			protocol: 'http',
			domain: 'foo.net'
		}).report();
	}, {
		'closedConnections': 1
	}),
	'connection not closed, more requests': mock.getContext('keepAlive', function(phantomas) {
		return phantomas.recv({
			protocol: 'http',
			domain: 'foo.net',
			url: 'http://foo.net/',
			headers: {}
		}).send({
			protocol: 'http',
			domain: 'foo.net'
		}).report();
	}, {
		'closedConnections': 0
	}),
}).
export(module);
