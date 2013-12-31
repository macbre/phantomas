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

// exit codes
var EXIT_SUCCESS = 0,
	EXIT_TIMED_OUT = 252,
	EXIT_CONFIG_FAILED = 253,
	EXIT_LOAD_FAILED = 254,
	EXIT_ERROR = 255;

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
	this.format = params.format || 'plain';

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

	// --skip-modules=jQuery,domQueries
	this.skipModules = (typeof params['skip-modules'] === 'string') ? params['skip-modules'].split(',') : [];

	// --user-agent=custom-agent
	this.userAgent = params['user-agent'] || getDefaultUserAgent();

	// disable JavaScript on the page that will be loaded
	this.disableJs = params['disable-js'] === true;

	// setup cookies handling
	this.initCookies();

	// setup the stuff
	this.emitter = new (this.require('events').EventEmitter)();
	this.emitter.setMaxListeners(200);

	this.util = this.require('util');

	this.page = require('webpage').create();

	// store the timestamp of responseEnd event
	// should be bound before modules
	this.on('responseEnd', this.proxy(function() {
		this.responseEndTime = Date.now();
	}));

	// setup logger
	var Logger = require('./logger'),
		logFile = params.log || '';

	this.logger = new Logger(logFile, {
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
		this.tearDown(EXIT_CONFIG_FAILED);
		return;
	}

	// queue of jobs that needs to be done before report can be generated
	var Queue = require('../lib/simple-queue');
	this.reportQueue = new Queue();

	// set up results wrapper
	var Results = require('./results');
	this.results = new Results();

	this.results.setGenerator('phantomas v' + VERSION);
	this.results.setUrl(this.url);
	this.results.setAsserts(this.params.asserts);

	// allow asserts to be provided via command-line options (#128)
	Object.keys(this.params).forEach(function(param) {
		var value = parseFloat(this.params[param]),
			name;

		if (!isNaN(value) && param.indexOf('assert-') === 0) {
			name = param.substr(7);

			if (name.length > 0) {
				this.results.setAssert(name, value);
			}
		}
	}, this);

	// load core modules
	this.log('Loading core modules...');
	this.addCoreModule('requestsMonitor');

	// load 3rd party modules
	var modules = (this.modules.length > 0) ? this.modules : this.listModules();

	modules.forEach(function(moduleName) {
		if (this.skipModules.indexOf(moduleName) > -1) {
			this.log('Module ' + moduleName + ' skipped!');
			return;
		}

		this.addModule(moduleName);
	}, this);
};

phantomas.version = VERSION;

phantomas.prototype = {
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

			// reports
			reportQueuePush: this.reportQueue.push.bind(this.reportQueue),

			// metrics
			setMetric: this.setMetric.bind(this),
			setMetricEvaluate: this.setMetricEvaluate.bind(this),
			setMetricFromScope: this.setMetricFromScope.bind(this),
			setMarkerMetric: this.setMarkerMetric.bind(this),
			getFromScope: this.getFromScope.bind(this),
			incrMetric: this.incrMetric.bind(this),
			getMetric: this.getMetric.bind(this),

			// offenders
			addOffender: this.addOffender.bind(this),

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

	// setup cookies handling
	initCookies: function() {
		// cookie handling via command line and config.json
		phantom.cookiesEnabled = true;

		// handles multiple cookies from config.json, and used for storing
		// constructed cookies from command line.
		this.cookies = this.params.cookies || [];

		// --cookie='bar=foo;domain=url'
		// for multiple cookies, please use config.json `cookies`.
		if (typeof this.params.cookie === 'string') {

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
	},

	// add cookies, if any, providing a domain shim
	injectCookies: function() {
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
	},

	// runs phantomas
	run: function() {
		// check required params
		if (!this.url) {
			throw '--url argument must be provided!';
		}

		// add cookies, if any, providing a domain shim.
		this.injectCookies();

		this.start = Date.now();

		// setup viewport
		var parsedViewport = this.viewport.split('x');

		if (parsedViewport.length === 2) {
			this.page.viewportSize = {
				width: parseInt(parsedViewport[0], 10) || 1280,
				height: parseInt(parsedViewport[1], 10) || 1024
			};
		}

		// setup user agent
		if (this.userAgent) {
			this.page.settings.userAgent = this.userAgent;
		}

		// disable JavaScript on the page that will be loaded
		if (this.disableJs) {
			this.page.settings.javascriptEnabled = false;
			this.log('JavaScript execution disabled by --disable-js!');
		}

		// print out debug messages
		this.log('Opening <' + this.url + '>...');
		this.log('Using ' + this.page.settings.userAgent + ' as user agent');
		this.log('Viewport set to ' + this.page.viewportSize.width + 'x' + this.page.viewportSize.height);

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
		// finish when the last request is completed + one second timeout
		var self = this;

		this.reportQueue.push(function(done) {
			var currentRequests = 0,
				timeoutId;

			// update HTTP requests counter
			self.on('send', function(entry) {
				clearTimeout(timeoutId);
				currentRequests++;
			});

			self.on('recv', function(entry) {
				currentRequests--;

				if (currentRequests < 1) {
					timeoutId = setTimeout(done, 1000);
				}
			});
		});

		this.reportQueue.push(function(done) {
			self.on('loadFinished', done);
		});

		// generate a report when all jobs are done
		this.reportQueue.done(this.report, this);

		// last time changes?
		this.emit('pageBeforeOpen', this.page);

		// open the page
		this.page.open(this.url);

		this.emit('pageOpen');

		// fallback - always timeout after TIMEOUT seconds
		this.log('Run timeout set to ' + this.timeout + ' s');
		setTimeout(function() {
			this.log('Timeout of ' + this.timeout + ' s was reached!');
			this.timedOut = true;

			this.report();
		}.bind(this), this.timeout * 1000);
	},

	// called when all HTTP requests are completed
	report: function() {
		this.emit('report');

		var time = Date.now() - this.start;
		this.log('phantomas run for <%s> completed in %d ms', this.page.url, time);

		this.results.setUrl(this.page.url);
		this.emit('results', this.results);

		// count all metrics
		var metricsCount = this.results.getMetricsNames().length;

		this.log('Formatting results (' + this.format + ') with ' + metricsCount+ ' metric(s)...');

		// render results
		var Formatter = require('./formatter'),
			renderer = new Formatter(this.results, this.format);

		this.echo(renderer.render());

		// handle timeouts (issue #129)
		if (this.timedOut) {
			this.log('Timed out!');
			this.tearDown(EXIT_TIMED_OUT);
			return;
		}

		// asserts handling
		var failedAsserts = this.results.getFailedAsserts(),
			failedAssertsCnt = failedAsserts.length;

		if (failedAssertsCnt > 0) {
			this.log('Failed on %d assert(s) on the following metric(s): %s!', failedAssertsCnt, failedAsserts.join(', '));

			// exit code should equal number of failed assertions
			this.tearDown(failedAssertsCnt);
			return;
		}

		this.log('Done!');
		this.tearDown();
	},

	tearDown: function(exitCode) {
		exitCode = exitCode || EXIT_SUCCESS;

		if (exitCode > 0) {
			this.log('Exiting with code #' + exitCode + '!');
		}

		this.page.close();
		phantom.exit(exitCode);
	},

	// core events
	onInitialized: function() {
		// add helper tools into window.__phantomas "namespace"
		if (!this.page.injectJs(module.dirname + '/scope.js')) {
			this.log('Unable to inject scope.js file!');
			this.tearDown(EXIT_ERROR);
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
				break;

			default:
				this.emit('loadFailed', status);
				this.tearDown(EXIT_LOAD_FAILED);
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

			case 'setMarkerMetric':
				this.setMarkerMetric(data.name);
				break;

			case 'addOffender':
				this.addOffender(data.metricName, data.msg);
				break;

			default:
				this.log('Message "' + type + '" from browser\'s scope: ' + JSON.stringify(data));
				this.emit('message', msg);
		}
	},

	onError: function(msg, trace) {
		this.emit('jserror', msg, trace);
	},

	// metrics reporting
	setMetric: function(name, value) {
		value = typeof value === 'string' ? value : (value || 0); // set to zero if undefined / null is provided
		this.results.setMetric(name, value);
	},

	setMetricEvaluate: function(name, fn) {
		this.setMetric(name, this.page.evaluate(fn));
	},

	setMarkerMetric: function(name) {
		var now = Date.now(),
			value = now - this.responseEndTime;

		if (typeof this.responseEndTime === 'undefined') {
			throw 'setMarkerMetric() called before responseEnd event!';
		}

		this.results.setMetric(name, value);
		return value;
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
		var currVal = this.getMetric(name) || 0;

		this.setMetric(name, currVal + (incr || 1));
	},

	getMetric: function(name) {
		return this.results.getMetric(name);
	},

	addOffender: function(metricName, msg) {
		this.results.addOffender(metricName, msg);
	},

	// adds a notice that will be emitted after results
	// supports phantomas.addNotice('foo: <%s>', url);
	addNotice: function() {
		this.results.addNotice(this.util.format.apply(this, arguments));
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

		// execFile(file, args, options, callback)
		// @see https://github.com/ariya/phantomjs/wiki/API-Reference-ChildProcess
		args = args || [];
		script = this.dir + script;

		ctx = execFile(script, args, null, function (err, stdout, stderr) {
			var time = Date.now() - start;

			if (err || stderr) {
				self.log('runScript: pid #%d failed - %s (took %d ms)!', pid, (err || stderr || 'unknown error').trim(), time);
			}
			else if (!pid) {
				self.log('runScript: failed running %s %s!', script, args.join(' '));
				return;
			}
			else {
				self.log('runScript: pid #%d done (took %d ms)', pid, time);
			}

			// (try to) parse JSON-encoded output
			try {
				callback(null, JSON.parse(stdout));
			}
			catch(ex) {
				self.log('runScript: JSON parsing failed!');
				callback(stderr, stdout);
			}
		});

		pid = ctx.pid;

		if (pid) {
			this.log('runScript: %s %s (pid #%d)', script, args.join(' '), pid);
		}
	}
};

module.exports = phantomas;
