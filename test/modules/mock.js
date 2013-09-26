/**
 * Defines phantomas global API mock
 */
var emitter = new (require('events').EventEmitter)();
var emitted = {};

var metrics = [];

var noop = function() {};

var phantomas = {
	require: function(name) {
		return require(name);
	},

	getParam: noop,

	// events
	emit: function(/* eventName, arg1, arg2, ... */) { //console.log('emit: ' + arguments[0]);
		emitter.emit.apply(emitter, arguments);
		emitted[arguments[0]] = true;
	},
	on: function(ev, fn) { //console.log('on: ' + ev);
		emitter.on(ev, fn);
	},
	once: function(ev, fn) {
		emitter.once(ev, fn);
	},

	emitted: function(ev) {
		return emitted[ev] === true;
	},

	// metrics
	setMetric: function(name, value) {
		metrics[name] = (typeof value !== 'undefined') ? value : 0;
	},
	setMetricEvaluate: noop,
	setMetricFromScope: noop,
	getFromScope: noop,
	incrMetric: function(name, incr /* =1 */) {
		metrics[name] = (metrics[name] || 0) + (incr || 1);
	},
	getMetric: function(name) {
		return metrics[name];
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
			emitter.emit('onResourceRequested', req);
		}
		catch(ex) {
			console.log(ex);
		}
	},
	recvRequest: function(req) {
		req = req || {};
		emitter.emit('onResourceReceived', req);
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
		var def = require('../../core/modules/' + name + '/' + name + '.js');
		var instance = new (def.module)(phantomas);
	}
	catch(ex) {
		console.log(ex);
	}

	return phantomas;
}

module.exports = {
	phantomas: phantomas,
	initCoreModule: initCoreModule
};
