/**
 * Defines phantomas global API mock
 */
var noop = function() {};

var phantomas = function() {
	this.emitter = new (require('events').EventEmitter)();
	this.wasEmitted = {};
	this.metrics = [];
}

phantomas.prototype = {
	require: function(name) {
		return require(name);
	},

	getParam: noop,

	// events
	emit: function(/* eventName, arg1, arg2, ... */) { //console.log('emit: ' + arguments[0]);
		this.emitter.emit.apply(this.emitter, arguments);
		this.wasEmitted[arguments[0]] = true;
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

	// noop mocks
	addNotice: noop,
	log: noop,
	echo: noop,
	evaluate: noop,
	injectJs: noop,
	getPageContent: noop,
	median: noop,
};

function initCoreModule(name) {
	try {
		var instance = new phantomas(),
			def = require('../../core/modules/' + name + '/' + name + '.js');

		new (def.module)(instance);
	}
	catch(ex) {
		console.log(ex);
	}

	return instance;
}

module.exports = {
	initCoreModule: initCoreModule,
	assertMetric: function(name, value) {
		value = value || 1;

		return function(phantomas) {
			phantomas.hasValue(name, value);
		}
	}
};
