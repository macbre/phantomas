/**
 * phantomas main file
 */

/**
 * Environment such PhantomJS 1.8.* does not provides the bind method on Function prototype.
 * This shim will ensure that source-map will not break when running on PhantomJS.
 *
 * @see https://github.com/abe33/source-map/commit/61131e53ceb3b69d387da3c6daad6adbbaaae9b3
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
 */
if(!Function.prototype.bind) {
	Function.prototype.bind = function(scope) {
		var self = this;
		return function() {
			return self.apply(scope, arguments);
		};
	};
}

// get phantomas version from package.json file
var VERSION = require('../package').version;

var getDefaultUserAgent = function() {
	var version = phantom.version,
		system = require('system'),
		os = system.os;

	return "phantomas/" + VERSION + " (PhantomJS/" + version.major + "." + version.minor + "." + version.patch + "; " + os.name + " " + os.architecture + ")";
};

var phantomas = function(params) {
	// handle JSON config file provided via --config
	var fs = require('fs'),
		jsonConfig;

	if (params.config && fs.isReadable(params.config)) {
		try {
			jsonConfig = JSON.parse( fs.read(params.config) ) || {};
		}
		catch(ex) {
			jsonConfig = {};
			params.config = false;
		}

		// allow parameters from JSON config to be overwritten
		// by those coming from command line
		Object.keys(jsonConfig).forEach(function(key) {
			if (typeof params[key] === 'undefined') {
				params[key] = jsonConfig[key];
			}
		});
	}

	// parse script CLI parameters
	this.params = params;

	// --url=http://example.com
	this.url = this.params.url;

	// --format=[csv|json]
	this.resultsFormat = params.format || 'plain';

	// --viewport=1280x1024
	this.viewport = params.viewport || '1280x1024';

	// --verbose
	this.verboseMode = params.verbose === true;

	// --silent
	this.silentMode = params.silent === true;

	// --timeout (in seconds)
	this.timeout = (params.timeout > 0 && parseInt(params.timeout, 10)) || 15;

	// --modules=localStorage,cookies
	this.modules = (typeof params.modules === 'string') ? params.modules.split(',') : [];

	// --skip-modules=jQeury,domQueries
	this.skipModules = (typeof params['skip-modules'] === 'string') ? params['skip-modules'].split(',') : [];

	// --user-agent=custom-agent
	this.userAgent = params['user-agent'] || getDefaultUserAgent();

	// cookie handling via command line and config.json
	phantom.cookiesEnabled = true;

	// handles multiple cookies from config.json, and used for storing
	// constructed cookies from command line.
	this.cookies = params.cookies || [];

	// --cookie='bar=foo;domain=url'
	// for multiple cookies, please use config.json `cookies`.
	if (typeof params.cookie === 'string') {

		// Parse cookie. at minimum, need a key=value pair, and a domain.
		// Domain attr, if unavailble, is created from `params.url` during
		//  addition to phantomjs in `phantomas.run`
		// Full JS cookie syntax is supported.

		var cookieComponents = params.cookie.split(';'),
			cookie = {};

		for (var i = 0, len = cookieComponents.length; i < len; i++) {
			var frag = cookieComponents[i].split('=');

			// special case: key-value
			if (i === 0) {
				cookie.name = frag[0];
				cookie.value = frag[1];

			// special case: secure
			} else if (frag[0] === 'secure') {
				cookie.secure = true;

			// everything else
			} else {
				cookie[frag[0]] = frag[1];
			}
		}

		// see phantomas.run for validation.
		this.cookies.push(cookie);
	}

	// setup the stuff
	this.emitter = new (this.require('events').EventEmitter)();
	this.emitter.setMaxListeners(200);

	this.util = this.require('util');

	this.page = require('webpage').create();

	// current HTTP requests counter
	this.currentRequests = 0;

	// setup logger
	var logger = require('./logger'),
		logFile = params.log || '';

	this.logger = new logger(logFile, {
		beVerbose: this.verboseMode,
		beSilent: this.silentMode
	});

	// report version and installation directory
	if (typeof module.dirname !== 'undefined') {
		this.dir = module.dirname.replace(/core$/, '');
		this.log('phantomas v' + VERSION + ' installed in ' + this.dir);
	}

	// report config file being used
	if (params.config) {
		this.log('Using JSON config file: ' + params.config);
	}
	else if (params.config === false) {
		this.log('Failed parsing JSON config file');
		this.tearDown(4);
	}

	// load core modules
	this.log('Loading core modules...');
	this.addCoreModule('requestsMonitor');

	// load 3rd party modules
	var modules = (this.modules.length > 0) ? this.modules : this.listModules(),
		self = this;

	modules.forEach(function(moduleName) {
		if (self.skipModules.indexOf(moduleName) > -1) {
			self.log('Module ' + moduleName + ' skipped!');
			return;
		}

		self.addModule(moduleName);
	});
};

phantomas.version = VERSION;

phantomas.prototype = {
	metrics: {},
	notices: [],
	jsErrors: [],

	// simple version of jQuery.proxy
	proxy: function(fn, scope) {
		scope = scope || this;
		return function () {
			return fn.apply(scope, arguments);
		};
	},

	// emit given event
	emit: function(/* eventName, arg1, arg2, ... */) {
		this.log('Event ' + arguments[0] + ' emitted');
		this.emitter.emit.apply(this.emitter, arguments);
	},

	// bind to a given event
	on: function(ev, fn) {
		this.emitter.on(ev, fn);
	},

	once: function(ev, fn) {
		this.emitter.once(ev, fn);
	},

	// returns "wrapped" version of phantomas object with public methods / fields only
	getPublicWrapper: function() {
		// modules API
		return {
			url: this.params.url,
			getParam: (function(key) {
				return this.params[key];
			}).bind(this),

			// events
			on: this.on.bind(this),
			once: this.once.bind(this),
			emit: this.emit.bind(this),

			// metrics
			setMetric: this.setMetric.bind(this),
			setMetricEvaluate: this.setMetricEvaluate.bind(this),
			setMetricFromScope: this.setMetricFromScope.bind(this),
			getFromScope: this.getFromScope.bind(this),
			incrMetric: this.incrMetric.bind(this),
			getMetric: this.getMetric.bind(this),

			// debug
			addNotice: this.addNotice.bind(this),
			log: this.log.bind(this),
			echo: this.echo.bind(this),

			// phantomJS
			evaluate: this.page.evaluate.bind(this.page),
			injectJs: this.page.injectJs.bind(this.page),
			require: this.require.bind(this),
			render: this.page.render.bind(this.page),
			setZoom: (function(zoomFactor) {
				this.page.zoomFactor = zoomFactor;
			}).bind(this),

			// utils
			median: this.median.bind(this),
			runScript: this.runScript.bind(this)
		};
	},

	// initialize given core phantomas module
	addCoreModule: function(name) {
		var pkg = require('./modules/' + name + '/' + name);

		// init a module
		pkg.module(this.getPublicWrapper());

		this.log('Core module ' + name + (pkg.version ? ' v' + pkg.version : '') + ' initialized');
	},

	// initialize given phantomas module
	addModule: function(name) {
		var pkg;
		try {
			pkg = require('./../modules/' + name + '/' + name);
		}
		catch (e) {
			this.log('Unable to load module "' + name + '"!');
			return false;
		}

		if (pkg.skip) {
			this.log('Module ' + name + ' skipped!');
			return false;
		}

		// init a module
		pkg.module(this.getPublicWrapper());

		this.log('Module ' + name + (pkg.version ? ' v' + pkg.version : '') + ' initialized');
		return true;
	},

	// returns list of 3rd party modules located in modules directory
	listModules: function() {
		this.log('Getting the list of all modules...');

		var fs = require('fs'),
			modulesDir = module.dirname + '/../modules',
			ls = fs.list(modulesDir) || [],
			modules = [];

		ls.forEach(function(entry) {
			if (fs.isFile(modulesDir + '/' + entry + '/' + entry + '.js')) {
				modules.push(entry);
			}
		});

		return modules;
	},

	// runs phantomas
	run: function(callback) {

		// check required params
		if (!this.url) {
			throw '--url argument must be provided!';
		}

		// add cookies, if any, providing a domain shim.
		if (this.cookies && this.cookies.length > 0) {

			// @see http://nodejs.org/docs/latest/api/url.html
			var parseUrl = this.require('url').parse;

			this.cookies.forEach(function(cookie) {

				// phantomjs required attrs: *name, *value, *domain
				if (!cookie.name || !cookie.value) {
					throw 'this cookie is missing a name or value property: ' + JSON.stringify(cookie);
				}

				if (!cookie.domain) {
					var parsed = parseUrl(params.url),
						root = parsed.hostname.replace(/^www/, ''); // strip www

					cookie.domain = root;
				}

				if (!phantom.addCookie(cookie)) {
					throw 'PhantomJS could not add cookie: ' + JSON.stringify(cookie);
				}

				this.log('Cookie set: ' + JSON.stringify(cookie));

			}, this /* scope */);
		}


		// to be called by tearDown
		this.onDoneCallback = callback;

		this.start = Date.now();

		// setup viewport
		var parsedViewport = this.viewport.split('x');

		if (parsedViewport.length === 2) {
			this.page.viewportSize = {
				height: parseInt(parsedViewport[0], 10) || 1280,
				width: parseInt(parsedViewport[1], 10) || 1024
			};
		}

		// setup user agent
		if (this.userAgent) {
			this.page.settings.userAgent = this.userAgent;
		}

		// print out debug messages
		this.log('Opening <' + this.url + '>...');
		this.log('Using ' + this.page.settings.userAgent + ' as user agent');
		this.log('Viewport set to ' + this.page.viewportSize.height + 'x' + this.page.viewportSize.width);

		// bind basic events
		this.page.onInitialized = this.proxy(this.onInitialized);
		this.page.onLoadStarted = this.proxy(this.onLoadStarted);
		this.page.onLoadFinished = this.proxy(this.onLoadFinished);
		this.page.onResourceRequested = this.proxy(this.onResourceRequested);
		this.page.onResourceReceived = this.proxy(this.onResourceReceived);

		// debug
		this.page.onAlert = this.proxy(this.onAlert);
		this.page.onConfirm = this.proxy(this.onConfirm);
		this.page.onPrompt = this.proxy(this.onPrompt);
		this.page.onConsoleMessage = this.proxy(this.onConsoleMessage);
		this.page.onCallback = this.proxy(this.onCallback);
		this.page.onError = this.proxy(this.onError);

		// observe HTTP requests
		// finish when the last request is completed

		// update HTTP requests counter
		this.on('send', this.proxy(function(entry) {
			this.currentRequests++;
		}));

		this.on('recv', this.proxy(function(entry) {
			this.currentRequests--;

			this.enqueueReport();
		}));

		// last time changes?
		this.emit('pageBeforeOpen', this.page);

		// open the page
		this.page.open(this.url);

		this.emit('pageOpen');

		// fallback - always timeout after TIMEOUT seconds
		this.log('Run timeout set to ' + this.timeout + ' s');
		setTimeout(this.proxy(function() {
			this.log('Timeout of ' + this.timeout + ' s was reached!');
			this.report();
		}), this.timeout * 1000);
	},

	/**
	 * Wait a second before finishing the monitoring (i.e. report generation)
	 *
	 * This one is called when response is received. Previously scheduled reporting is removed and the new is created.
	 */
	enqueueReport: function() {
		clearTimeout(this.lastRequestTimeout);

		if (this.currentRequests < 1) {
			this.lastRequestTimeout = setTimeout(this.proxy(this.report), 1000);
		}
	},

	// called when all HTTP requests are completed
	report: function() {
		this.emit('report');

		var time = Date.now() - this.start;
		this.log('phantomas work done in ' + time + ' ms');

		// format results
		var results = {
			url: this.url,
			metrics: this.metrics,
			notices: this.notices,
			jsErrors: this.jsErrors
		};

		this.emit('results', results);

		// count all metrics
		var metricsCount = 0,
			i;

		for (i in this.metrics) {
			metricsCount++;
		}

		this.log('Formatting results (' + this.resultsFormat + ') with ' + metricsCount+ ' metric(s)...');

		// render results
		var formatter = require('./formatter'),
			renderer = new formatter(results, this.resultsFormat);

		this.echo(renderer.render());

		this.log('Done!');
		this.tearDown(0);
	},

	tearDown: function(exitCode) {
		exitCode = exitCode || 0;

		if (exitCode > 0) {
			this.log('Exiting with code #' + exitCode + '!');
		}

		this.page.close();

		// call function provided to run() method
		if (typeof this.onDoneCallback === 'function') {
			this.onDoneCallback();
		}
		else {
			phantom.exit(exitCode);
		}
	},

	// core events
	onInitialized: function() {
		// add helper tools into window.__phantomas "namespace"
		if (!this.page.injectJs(module.dirname + '/scope.js')) {
			this.log('Unable to inject scope.js file!');
			this.tearDown(3);
			return;
		}

		this.log('Page object initialized');
		this.emit('init');
	},

	onLoadStarted: function() {
		this.log('Page loading started');
		this.emit('loadStarted');
	},

	onResourceRequested: function(res, request /* added in PhantomJS v1.9 */) {
		this.emit('onResourceRequested', res, request);
		//this.log(JSON.stringify(res));
	},

	onResourceReceived: function(res) {
		this.emit('onResourceReceived', res);
		//this.log(JSON.stringify(res));
	},

	onLoadFinished: function(status) {
		// trigger this only once
		if (this.onLoadFinishedEmitted) {
			return;
		}
		this.onLoadFinishedEmitted = true;

		// we're done
		this.log('Page loading finished ("' + status + '")');

		switch(status) {
			case 'success':
				this.emit('loadFinished', status);
				this.enqueueReport();
				break;

			default:
				this.emit('loadFailed', status);
				this.tearDown(2);
				break;
		}
	},

	// debug
	onAlert: function(msg) {
		this.log('Alert: ' + msg);
		this.emit('alert', msg);
	},

	onConfirm: function(msg) {
		this.log('Confirm: ' + msg);
		this.emit('confirm', msg);
	},

	onPrompt: function(msg) {
		this.log('Prompt: ' + msg);
		this.emit('prompt', msg);
	},

	onConsoleMessage: function(msg) {
		var prefix, data;

		// split "foo:content"
		prefix = msg.substr(0,3);
		data = msg.substr(4);

		try {
			data = JSON.parse(data);
		}
		catch(ex) {
			// fallback to plain log
			prefix = false;
		}

		//console.log(JSON.stringify([prefix, data]));

		switch(prefix) {
			// handle JSON-encoded messages from browser's scope sendMsg()
			case 'msg':
				this.onCallback(data);
				break;

			// console.log arguments are passed as JSON-encoded array
			case 'log':
				msg = this.util.format.apply(this, data);

				this.log('console.log: ' + msg);
				this.emit('consoleLog', msg, data);
				break;

			default:
				this.log(msg);
		}
	},

	// https://github.com/ariya/phantomjs/wiki/API-Reference-WebPage#oncallback
	onCallback: function(msg) {
		var type = msg && msg.type || '',
			data = msg && msg.data || {};

		switch(type) {
			case 'log':
				this.log(data);
				break;

			case 'setMetric':
				this.setMetric(data.name, data.value);
				break;

			case 'incrMetric':
				this.incrMetric(data.name, data.incr);
				break;

			default:
				this.log('Message "' + type + '" from browser\'s scope: ' + JSON.stringify(data));
				this.emit('message', msg);
		}
	},

	onError: function(msg, trace) {
		this.log(msg);
		this.emit('jserror', msg, trace);
	},

	// metrics reporting
	setMetric: function(name, value) {
		this.metrics[name] = (typeof value !== 'undefined') ? value : 0;
	},

	setMetricEvaluate: function(name, fn) {
		this.setMetric(name, this.page.evaluate(fn));
	},

	// set metric from browser's scope that was set there using using window.__phantomas.set()
	setMetricFromScope: function(name, key) {
		key = key || name;

		// @ee https://github.com/ariya/phantomjs/wiki/API-Reference-WebPage#evaluatefunction-arg1-arg2--object
		this.setMetric(name, this.page.evaluate(function(key) {
			return window.__phantomas.get(key) || 0;
		}, key));
	},

	// get a value set using window.__phantomas browser scope
	getFromScope: function(key) {
		return this.page.evaluate(function(key) {
			return window.__phantomas.get(key);
		}, key);
	},

	// increements given metric by given number (default is one)
	incrMetric: function(name, incr /* =1 */) {
		this.metrics[name] = (this.metrics[name] || 0) + (incr || 1);
	},

	getMetric: function(name) {
		return this.metrics[name];
	},

	// adds a notice that will be emitted after results
	// supports phantomas.addNotice('foo: <%s>', url);
	addNotice: function() {
		this.notices.push(this.util.format.apply(this, arguments));
	},

	// add log message
	// will be printed out only when --verbose
	// supports phantomas.log('foo: <%s>', url);
	log: function() {
		this.logger.log(this.util.format.apply(this, arguments));
	},

	// console.log wrapper obeying --silent mode
	echo: function(msg) {
		this.logger.echo(msg);
	},

	// require CommonJS module from lib/modules
	require: function(module) {
		return require('../lib/modules/' + module);
	},

	// returns median value for given set
	median: function(arr) {
		var half = Math.floor(arr.length/2);

		arr.sort(function(a,b) {
			return a - b;
		});

		return (arr.length % 2) ? arr[half] : ((arr[half-1] + arr[half]) / 2.0);
	},

	// runs a given helper script from phantomas main directory
	// tries to parse it's output (assumes JSON formatted output)
	runScript: function(script, args, callback) {
		var execFile = require("child_process").execFile,
			start = Date.now(),
			self = this,
			pid,
			ctx;

		if (typeof args === 'function') {
			callback = args;
		}

		// format a command
		// @see https://github.com/ariya/phantomjs/blob/master/examples/child_process-examples.js
		args = [
			'node',
			this.dir + script,
		].concat(
			Array.isArray(args) ? args : []
		);

		// @see https://github.com/ariya/phantomjs/wiki/API-Reference-ChildProcess
		// execFile(file, args, options, callback)
		ctx = execFile('/usr/bin/env', args, null, function (err, stdout, stderr) {
			var time = Date.now() - start;

			if (err || stderr) {
				self.log('runScript: pid #%d failed - %s (took %d ms)!', pid, (err || stderr || 'unknown error').trim(), time);
			}
			else {
				self.log('runScript: pid #%d done (took %d ms)', pid, time);
			}

			// (try to) parse JSON-encoded output
			try {
				callback(null, JSON.parse(stdout));
			}
			catch(ex) {
				callback(stderr, stdout);
			}
		});

		pid = ctx.pid;

		this.log('runScript: %s (pid #%d)', args.join(' '), pid);
	}
};

module.exports = phantomas;
