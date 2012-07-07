/**
 * phantomas main file
 */

var phantomas = function(params) {
	this.params = params;
	this.debugMode = params.debug === true;

	this.emitter = new (require('events').EventEmitter)();
	this.metrics = [];
	this.page = require('webpage').create();
};

exports.phantomas = phantomas;

phantomas.prototype = {
	// simple version of jQuery.proxy
	proxy: function(fn) {
		var scope = this;
		return function () {
			return fn.apply(scope, arguments);
		}
	},

	// emit given event
	emit: function(/* args */) {
		this.debug('Event ' + arguments[0] + ' emitted');
		this.emitter.emit.apply(this.emitter, arguments);
	},

	// bind to a given event
	on: function(ev, fn) {
		this.emitter.on(ev, fn);
	},

	// initialize given phantomas module
	addModule: function(name) {
		var module = require('./../modules/' + name).module;

		// init a module
		// TODO: pass wrapped object with limited methods
		module(this);
		/**
		module({
			url: this.params.url,
			params: this.params,
			on: this.on,
			emit: this.emit,
			debug: this.debug
		});
		/**/

		this.debug('Module ' + name + ' initialized');
	},
 
	// runs phantomas
	run: function() {
		var url = this.params.url;

		// check required params
		if (!url) {
			throw '--url argument must be provided!';
		}

		this.debug('Opening <' + url + '>...');
		this.debug('Using ' + this.page.settings.userAgent);
		this.debug('Viewport ' + this.page.viewportSize.height + 'x' + this.page.viewportSize.width);

		// bind basic events
		this.page.onLoadStarted = this.proxy(this.onLoadStarted);
		this.page.onLoadFinished = this.proxy(this.onLoadFinished);

		// open the page
		this.page.open(url, this.onPageOpened);

		this.emit('pageOpen');
	},

	// core events
	onLoadStarted: function() {
		this.debug('Page loading started');
		this.emit('loadStarted');
	},

	onLoadFinished: function(status) {
		this.debug('Page loading finished ("' + status + '")');
		this.emit('loadFinished');
		phantom.exit();
	},

	// add debug message
	// will be printed out only when --debug
	debug: function(msg) {
		if (this.debugMode) {
			console.log('> ' + msg);
		}
	}
};
