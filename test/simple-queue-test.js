/**
 * Tests simple-queue lib
 */
var vows = require('vows'),
	assert = require('assert'),
	Queue = require('../lib/simple-queue');

// run the test
vows.describe('simple-queue').addBatch({
	'done()': {
		topic: function() {
			var q = new Queue();
			q.done(this.callback);
		},
		'should be completed immediately if there are no jobs pushed': function(err, stats) {
			assert.strictEqual(stats && stats.jobs, 0);
		}
	},
	'done() + push()': {
		topic: function() {
			var q = new Queue();
			q.done(function() {});
			this.callback(null, q);
		},
		'should throw an error': function(err, q) {
			assert.throws(q.push);
		}
	},
	'push() + done() + done()': {
		topic: function() {
			var q = new Queue(),
				called = 0;

			q.
				push(function(done) {
					called++;
					done();
				}).
				push(function(done) {
					setTimeout(function() {
						called++;
						done();
					});
				}).
				done(function() {
					called++;
				}).
				done(function(err, stats) {
					called++;
					this.callback(null, called, stats);
				}, this);
		},
		'should call all done() callbacks': function(err, called) {
			assert.equal(called, 4);
		},
		'should pass stats to done() callback': function(err, called, stats) {
			assert.equal(stats && stats.jobs, 2);
		}
	},
	'push() + async + done()': {
		topic: function() {
			var q = new Queue(),
				called = 0;

			q.
				push(function(done) {
					setTimeout(function() {
						called++;
						done();
					}, 0);
				}).
				push(function(done) {
					called++;
					done();
				}).
				done(function() {
					this.callback(null, called);
				}, this);
		},
		'should be completed when all jobs are done': function(err, called) {
			assert.equal(called, 2);
		}
	},
	'push() + async + done() + delayed push()': {
		topic: function() {
			var q = new Queue(),
				called = 0;

			q.
				push(function(done) {
					setTimeout(function() {
						called++;
						done();
					}, 0);
				}).
				push(function(done) {
					called++;
					done();
				}).
				done(function() {
					this.callback(null, called);
				}, this).
				push(function(done) {
					setTimeout(function() {
						called++;
						done();
					}, 0);
				});
		},
		'should be completed when all jobs are done': function(err, called) {
			assert.equal(called, 3);
		}
	}

}).export(module);
