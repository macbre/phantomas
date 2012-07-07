/**
 * phantomas main file
 */

var VERSION = '0.1';

var phantomas = function(params) {
	this.params = params;
	this.verboseMode = params.verbose === true;
	this.version = VERSION;

	this.emitter = new (require('events').EventEmitter)();
	this.metrics = {};
	this.page = require('webpage').create();

	this.log('phantomas v' + this.version);
};

exports.phantomas = phantomas;

phantomas.prototype = {
	// simple version of jQuery.proxy
	proxy: function(fn, scope) {
		scope = scope || this;
		return function () {
			return fn.apply(scope, arguments);
		}
	},

	// emit given event
	emit: function(/* args */) {
		this.log('Event ' + arguments[0] + ' emitted');
		this.emitter.emit.apply(this.emitter, arguments);
	},

	// bind to a given event
	on: function(ev, fn) {
		this.emitter.on(ev, fn);
	},

	// returns "wrapped" version of phantomas object with public methods / fields only
	getPublic: function() {
		var self = this;

		return {
			url: this.params.url,
			params: this.params,
			on: function() {self.on.apply(self, arguments)},
			emit: function() {self.emit.apply(self, arguments)},
			setMetric: function() {self.setMetric.apply(self, arguments)},
			incrMetric: function() {self.incrMetric.apply(self, arguments)},
			log: function(msg) {self.log(msg)},
			evaluate: function(fn) {return self.page.evaluate(fn)}
		};
	},

	// initialize given phantomas module
	addModule: function(name) {
		var module = require('./../modules/' + name).module;

		// init a module
		module(this.getPublic());

		this.log('Module ' + name + ' initialized');
	},
 
	// runs phantomas
	run: function() {
		var url = this.params.url;

		// check required params
		if (!url) {
			throw '--url argument must be provided!';
		}

		this.log('Opening <' + url + '>...');
		this.log('Using ' + this.page.settings.userAgent);
		this.log('Viewport ' + this.page.viewportSize.height + 'x' + this.page.viewportSize.width);

		// bind basic events
		this.page.onLoadStarted = this.proxy(this.onLoadStarted);
		this.page.onLoadFinished = this.proxy(this.onLoadFinished);
		this.page.onResourceRequested = this.proxy(this.onResourceRequested);
		this.page.onResourceReceived = this.proxy(this.onResourceReceived);

		// open the page
		this.page.open(url, this.onPageOpened);

		this.emit('pageOpen');
	},

	// core events
	onLoadStarted: function() {
		this.log('Page loading started');
		this.emit('loadStarted');
	},

	onResourceRequested: function(res) {
		this.emit('onResourceRequested', res);
		this.log(JSON.stringify(res));
	},

	onResourceReceived: function(res) {
		this.emit('onResourceReceived', res);
		this.log(JSON.stringify(res));
	},

	onLoadFinished: function(status) {
		this.log('Page loading finished ("' + status + '")');
		this.emit('loadFinished');

		this.log('phantomas work is done here');

		// format results
		var results = {
			metrics: this.metrics
		};

		console.log(JSON.stringify(results));
		phantom.exit();
	},

	// metrics reporting
	setMetric: function(name, value) {
		this.metrics[name] = (typeof value !== 'undefined') ? value : 0;
	},

	// increements given metric by given number (default is one)
	incrMetric: function(name, incr /* =1 */) {
		this.metrics[name] = (this.metrics[name] || 0) + (incr || 1);
	},

	// add log message
	// will be printed out only when --verbose
	log: function(msg) {
		if (this.verboseMode) {
			console.log('> ' + msg);
		}
	}
};
