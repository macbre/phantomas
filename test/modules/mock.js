/**
 * Defines phantomas global API mock
 */
var assert = require('assert'),
	noop = function() {};

var phantomas = function() {
	this.emitter = new (require('events').EventEmitter)();
	this.wasEmitted = {};
	this.metrics = [];
};

phantomas.prototype = {
	require: function(name) {
		return require(name);
	},

	getParam: noop,

	// events
	emit: function(/* eventName, arg1, arg2, ... */) { //console.log('emit: ' + arguments[0]);
		try {
			this.emitter.emit.apply(this.emitter, arguments);
		}
		catch(ex) {
			console.log(ex);
		}

		this.wasEmitted[arguments[0]] = true;
		return this;
	},
	on: function(ev, fn) { //console.log('on: ' + ev);
		this.emitter.on(ev, fn);
	},
	once: function(ev, fn) {
		this.emitter.once(ev, fn);
	},

	emitted: function(ev) {
		return this.wasEmitted[ev] === true;
	},

	// metrics
	setMetric: function(name, value) {
		this.metrics[name] = (typeof value !== 'undefined') ? value : 0;
	},
	setMetricEvaluate: noop,
	setMetricFromScope: noop,
	getFromScope: noop,
	incrMetric: function(name, incr /* =1 */) {
		this.metrics[name] = (this.metrics[name] || 0) + (incr || 1);
	},
	getMetric: function(name) {
		return this.metrics[name];
	},
	hasValue: function(name, val) {
		return this.getMetric(name) === val;
	},

	// mock core PhantomJS events
	sendRequest: function(req) {
		req = req || {};
		req.id = req.id || 1;
		req.method = req.method || 'GET';
		req.url = req.url || 'http://example.com';
		req.headers = req.headers || [];

		try {
			this.emitter.emit('onResourceRequested', req, {abort: noop});
		}
		catch(ex) {
			console.log(ex);
		}

		return this;
	},
	recvRequest: function(req) {
		req = req || {};
		req.stage = req.stage || 'end';
		req.id = req.id || 1;
		req.method = req.method || 'GET';
		req.url = req.url || 'http://example.com';
		req.headers = req.headers || [];

		try {
			this.emitter.emit('onResourceRequested', req);
			this.emitter.emit('onResourceReceived', req);
		}
		catch(ex) {
			console.log(ex);
		}

		return this;
	},

	// phantomas-specific events
	send: function(entry, res) {
		return this.emit('send', entry || {}, res || {});
	},

	recv: function(entry, res) {
		return this.emit('recv', entry || {}, res || {});
	},

	report: function() {
		return this.emit('report');
	},

	// noop mocks
	addNotice: noop,
	addOffender: noop,
	log: noop,
	echo: noop,
	evaluate: noop,
	injectJs: noop
};

function initModule(name, isCore) {
	var instance, def;

	try {
		instance = new phantomas();
		def = require('../../' + (isCore ? 'core/modules' : 'modules') + '/' + name + '/' + name + '.js');

		new (def.module)(instance);
	}
	catch(ex) {
		console.log(ex);
	}

	return instance;
}

function assertMetric(name, value) {
	value = value || 1;

	return function(phantomas) {
		assert.strictEqual(value, phantomas.getMetric(name));
	};
}

module.exports = {
	initModule: function(name) {
		return initModule(name);
	},
	initCoreModule: function(name) {
		return initModule(name, true /* core */);
	},

	assertMetric: assertMetric,

	getContext: function(moduleName, topic, metricsCheck) {
		var phantomas = initModule(moduleName),
			context = {};

		context.topic = function() {
			return topic(phantomas);
		};

		Object.keys(metricsCheck || {}).forEach(function(name) {
			var check = 'sets "' + name + '" metric correctly';
			context[check] = assertMetric(name, metricsCheck[name]);
		});

		return context;
	}
};
