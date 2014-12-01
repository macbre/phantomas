/**
 * phantomas main file
 */
/* global phantom: true, window: true */
'use strict';

/**
 * Environment such PhantomJS 1.8.* does not provides the bind method on Function prototype.
 * This shim will ensure that source-map will not break when running on PhantomJS.
 *
 * @see https://github.com/abe33/source-map/commit/61131e53ceb3b69d387da3c6daad6adbbaaae9b3
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
 */
if (!Function.prototype.bind) {
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

var phantomas = function(params) {
	var fs = require('fs');

	// store script CLI parameters
	this.params = params;

	// --url=http://example.com
	this.url = params.url;

	// --format
	this.format = params.format;

	// --verbose
	this.verboseMode = params.verbose === true;

	// --silent
	this.silentMode = params.silent === true;

	// --timeout (in seconds)
	this.timeout = (params.timeout > 0 && parseInt(params.timeout, 10)) || 15;

	// --modules=localStorage,cookies
	this.modules = (typeof params.modules === 'string') ? params.modules.split(',') : [];

	// --include-dirs=dirOne,dirTwo
	this.includeDirs = (typeof params['include-dirs'] === 'string') ? params['include-dirs'].split(',') : [];

	// --skip-modules=jQuery,domQueries
	this.skipModules = (typeof params['skip-modules'] === 'string') ? params['skip-modules'].split(',') : [];

	// disable JavaScript on the page that will be loaded
	this.disableJs = params['disable-js'] === true;

	// setup the stuff
	this.emitter = new(this.require('events').EventEmitter)();
	this.emitter.setMaxListeners(200);
	this.ipc = require('./ipc');

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

	// detect phantomas working directory
	if (typeof module.dirname !== 'undefined') {
		this.dir = module.dirname.replace(/core$/, '');
	} else if (typeof slimer !== 'undefined') {
		var args = require('system').args;
		this.dir = fs.dirname(args[0]).replace(/scripts$/, '');
	}

	this.log('phantomas v%s: %s', this.getVersion(), this.dir);
	this.log('Options: %j', this.params);

	// queue of jobs that needs to be done before report can be generated
	var Queue = require('../lib/simple-queue');
	this.reportQueue = new Queue();

	// set up results wrapper
	var Results = require('./results');
	this.results = new Results();

	this.results.setGenerator('phantomas v' + this.getVersion());
	this.results.setUrl(this.url);

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
	this.log('Loading: core modules...');
	this.addCoreModule('requestsMonitor');
	this.addCoreModule('timeToFirstByte');

	// load extensions
	this.log('Loading: extensions...');
	var extensions = this.listExtensions();
	extensions.forEach(this.addExtension, this);

	// load modules
	this.log('Loading: modules...');
	var modules = (this.modules.length > 0) ? this.modules : this.listModules();
	modules.forEach(this.addModule, this);

	// load 3rd party modules
	this.log('Loading: 3rd party modules...');
	this.includeDirs.forEach(function(dirName) {
		var dirPath = fs.absolute(dirName),
			dirModules = this.listModulesInDir(dirPath);

		dirModules.forEach(function(moduleName) {
			this.addModuleInDir(dirPath, moduleName);
		}, this);

	}, this);
};

phantomas.version = VERSION;

phantomas.prototype = {
	// simple version of jQuery.proxy
	proxy: function(fn, scope) {
		scope = scope || this;
		return function() {
			return fn.apply(scope, arguments);
		};
	},

	// emit given event and pass it to CommonJS API via IPC
	emit: function( /* eventName, arg1, arg2, ... */ ) {
		this.emitInternal.apply(this, arguments);

		// pass it via IPC
		var args = Array.prototype.slice.apply(arguments),
			eventName = args.shift(),
			ipc = new this.ipc(eventName);

		ipc.push.apply(ipc, args);
	},

	// emit given event "internally"
	emitInternal: function( /* eventName, arg1, arg2, ... */ ) {
		this.log('Event %s emitted', arguments[0]);
		this.emitter.emit.apply(this.emitter, arguments);
	},

	// bind to a given event
	on: function(ev, fn) {
		this.emitter.on(ev, fn);
	},

	once: function(ev, fn) {
		this.emitter.once(ev, fn);
	},

	getVersion: function() {
		return VERSION;
	},

	getParam: function(key, defValue, typeCheck) {
		var value = this.params[key];

		// strict type check
		if (typeof typeCheck === 'string' && typeof value !== typeCheck) {
			value = undefined;
		}

		return value || defValue;
	},

	// returns "wrapped" version of phantomas object with public methods / fields only
	getPublicWrapper: function() {
		function setParam(key, value) {
			/* jshint validthis: true */
			this.log('setParam: %s set to %j', key, value);
			this.params[key] = value;
		}

		function setZoom(zoomFactor) {
			/* jshint validthis: true */
			this.page.zoomFactor = zoomFactor;
		}

		// modules API
		return {
			url: this.params.url,
			getVersion: this.getVersion.bind(this),
			getParam: this.getParam.bind(this),
			setParam: setParam.bind(this),

			// events
			on: this.on.bind(this),
			once: this.once.bind(this),
			emit: this.emit.bind(this),
			emitInternal: this.emitInternal.bind(this),

			// reports
			reportQueuePush: this.reportQueue.push.bind(this.reportQueue),

			// metrics
			setMetric: this.setMetric.bind(this),
			setMetricEvaluate: this.setMetricEvaluate.bind(this),
			setMarkerMetric: this.setMarkerMetric.bind(this),
			incrMetric: this.incrMetric.bind(this),
			getMetric: this.getMetric.bind(this),

			// offenders
			addOffender: this.addOffender.bind(this),

			// debug
			log: this.log.bind(this),
			echo: this.echo.bind(this),

			// phantomJS
			evaluate: this.page.evaluate.bind(this.page),
			injectJs: this.page.injectJs.bind(this.page),
			require: this.require.bind(this),
			render: this.page.render.bind(this.page),
			setZoom: setZoom.bind(this),
			getSource: this.getSource.bind(this),

			// utils
			runScript: this.runScript.bind(this),
			tmpdir: this.tmpdir.bind(this)
		};
	},

	// initialize given core phantomas module
	addCoreModule: function(name) {
		var pkg = require('./modules/' + name + '/' + name);

		// init a module
		pkg.module(this.getPublicWrapper());

		this.log('Core module %s%s initialized', name, (pkg.version ? ' v' + pkg.version : ''));
	},

	// initialize given phantomas extension
	addExtension: function(name) {
		return this.addModuleInDir('./../extensions', name);
	},

	// initialize given phantomas module
	addModule: function(name) {
		return this.addModuleInDir('./../modules', name);
	},

	// initialize given phantomas module from dir
	addModuleInDir: function(dir, name) {
		var pkg;
		if (this.skipModules.indexOf(name) > -1) {
			this.log('Module %s skipped!', name);
			return;
		}
		try {
			pkg = require(dir + '/' + name + '/' + name);
		} catch (e) {
			this.log('Unable to load module "%s" from %s!', name, dir);
			this.log('%s!', e);
			return false;
		}

		if (pkg.skip) {
			this.log('Module %s skipped!', name);
			return false;
		}

		// init a module
		pkg.module(this.getPublicWrapper());

		this.log('Module %s%s initialized', name, (pkg.version ? ' v' + pkg.version : ''));
		return true;
	},

	// returns list of extensions located in modules directory
	listExtensions: function() {
		return this.listModulesInDir(this.dir + 'extensions');
	},

	// returns list of modules located in modules directory
	listModules: function() {
		return this.listModulesInDir(this.dir + 'modules');
	},

	// returns list of 3rd party modules located in modules directory
	listModulesInDir: function(modulesDir) {
		this.log('Getting the list of all modules in %s...', modulesDir);

		var fs = require('fs'),
			ls = fs.list(modulesDir) || [],
			modules = [];

		ls.forEach(function(entry) {
			/**
			 * README.md will be listed as an entry. That caused issue #409:
			 * SlimerJS raised: "Component returned failure code: 0x80520005 (NS_ERROR_FILE_DESTINATION_NOT_DIR) [nsILocalFile.isFile]"
			 *
			 * First check whether an entry is a directory, than check if it contains a module file
			 */
			if (fs.isDirectory(modulesDir + '/' + entry) && fs.isFile(modulesDir + '/' + entry + '/' + entry + '.js')) {
				modules.push(entry);
			}
		});

		// SlimerJS 'fs.list' does not order the returned array
		// PhantomJS does that, so be consistent here :)
		return modules.sort();
	},

	// setup polling for loading progress (issue #204)
	// pipe JSON messages over stderr
	initLoadingProgress: function() {
		var currentProgress = false;

		function pollFn() {
			/* jshint validthis: true */
			var inc;

			if (currentProgress >= this.page.loadingProgress) {
				return;
			}

			// store the change and update the current progress
			inc = this.page.loadingProgress - currentProgress;
			currentProgress = this.page.loadingProgress;

			this.log('Loading progress: %d%', currentProgress);

			this.emit('progress', currentProgress, inc); // @desc loading progress has changed
		}

		if (typeof this.page.loadingProgress !== 'undefined') {
			setInterval(pollFn.bind(this), 50);
		} else {
			this.log('Loading progress: not available!');
		}
	},

	// runs phantomas
	run: function() {
		// check required params
		if (!this.url) {
			throw '--url argument must be provided!';
		}

		this.start = Date.now();

		// setup viewport / --viewport=1280x1024
		var parsedViewport = this.getParam('viewport', '1280x1024', 'string').split('x');

		if (parsedViewport.length === 2) {
			this.page.viewportSize = {
				width: parseInt(parsedViewport[0], 10) || 1280,
				height: parseInt(parsedViewport[1], 10) || 1024
			};
		}

		// setup user agent /  --user-agent=custom-agent
		this.page.settings.userAgent = this.getParam('user-agent');

		// disable JavaScript on the page that will be loaded
		if (this.disableJs) {
			this.page.settings.javascriptEnabled = false;
			this.log('JavaScript execution disabled by --disable-js!');
		}

		// print out debug messages
		this.log('Opening <%s>...', this.url);
		this.log('Using %s as user agent', this.page.settings.userAgent);
		this.log('Viewport set to %d x %d', this.page.viewportSize.width, this.page.viewportSize.height);

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

		this.initLoadingProgress();

		// observe HTTP requests
		// finish when the last request is completed + one second timeout
		var self = this;

		this.reportQueue.push(function(done) {
			var currentRequests = 0,
				requestsUrls = {},
				onFinished = function(entry) {
					currentRequests--;
					delete requestsUrls[entry.url];

					if (currentRequests < 1) {
						timeoutId = setTimeout(function() {
							done();
						}, 1000);
					}
				},
				timeoutId;

			// update HTTP requests counter
			self.on('send', function(entry) {
				clearTimeout(timeoutId);

				currentRequests++;
				requestsUrls[entry.url] = true;
			});

			self.on('recv', onFinished);
			self.on('abort', onFinished);

			// add debug info about pending responses (issue #216)
			self.on('timeout', function() {
				self.log('Timeout: gave up waiting for %d HTTP response(s): <%s>', currentRequests, Object.keys(requestsUrls).join('>, <'));
			});
		});

		this.reportQueue.push(function(done) {
			self.on('loadFinished', done);
		});

		// generate a report when all jobs are done
		this.reportQueue.done(this.report, this);

		// last time changes?
		this.emitInternal('pageBeforeOpen', this.page); // @desc page.open is about to be called

		// open the page
		this.page.open(this.url);

		this.emitInternal('pageOpen'); // @desc page.open has been called

		// fallback - always timeout after TIMEOUT seconds
		this.log('Timeout set to %d sec', this.timeout);
		setTimeout(function() {
			this.log('Timeout of %d sec was reached!', this.timeout);

			this.emitInternal('timeout'); // @desc phantomas has timed out
			this.timedOut = true;

			this.report();
		}.bind(this), this.timeout * 1000);
	},

	// called when all HTTP requests are completed
	report: function() {
		this.emitInternal('report'); // @desc the report is about to be generated

		var time = Date.now() - this.start;
		this.log('phantomas run for <%s> completed in %d ms', this.page.url, time);

		this.results.setUrl(this.page.url);
		this.emitInternal('results', this.results); // @desc modify the results

		// count all metrics
		this.log('Returning results with %d metric(s)...', this.results.getMetricsNames().length);

		// emit results in JSON
		var formatter = require('./formatter');
		this.emit('json', formatter(this.results));

		// handle timeouts (issue #129)
		if (this.timedOut) {
			this.tearDown(EXIT_TIMED_OUT, 'Timeout');
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

	tearDown: function(exitCode, msg) {
		exitCode = exitCode || EXIT_SUCCESS;

		if (exitCode > 0) {
			this.log('Exiting with code #%d%s!', exitCode, msg ? ' (' + msg + ')' : '');
		}

		this.emit('exit', exitCode, msg);
		this.page.close();

		phantom.exit(exitCode);
	},

	// core events
	onInitialized: function() {
		// SlimerJS triggers this event twice
		// @see https://github.com/laurentj/slimerjs/blob/master/docs/api/webpage.rst#oninitialized
		if (this.page.url === '') {
			this.log('onInit: webpage.url is empty, waiting for the second trigger...');
			return;
		}

		// add helper tools into window.__phantomas "namespace"
		if (!this.page.injectJs(this.dir + 'core/scope.js')) {
			this.tearDown(EXIT_ERROR, 'Scope script injection failed');
			return;
		}

		this.log('onInit: page object initialized');
		this.emitInternal('init'); // @desc page has been initialized, scripts can be injected
	},

	onLoadStarted: function(url, isFrame) {
		if (this.onLoadStartedEmitted) {
			return;
		}

		// onLoadStarted is called for the page and each iframe
		// tigger "loadStarted" event just once
		this.onLoadStartedEmitted = true;

		this.log('Page loading started');
		this.emitInternal('loadStarted'); // @desc page loading has started
	},

	onResourceRequested: function(res, request /* added in PhantomJS v1.9 */ ) {
		this.emitInternal('onResourceRequested', res, request); // @desc HTTP request has been sent
		//this.log(JSON.stringify(res));
	},

	onResourceReceived: function(res) {
		this.emitInternal('onResourceReceived', res); // @desc HTTP response has been received
		//this.log(JSON.stringify(res));
	},

	onLoadFinished: function(status) {
		// trigger this only once
		if (this.onLoadFinishedEmitted) {
			return;
		}
		this.onLoadFinishedEmitted = true;

		// we're done
		this.log('Page loading finished ("%s")', status);

		switch (status) {
			case 'success':
				this.emitInternal('loadFinished', status); // @desc page has been fully loaded
				break;

			default:
				this.emitInternal('loadFailed', status); // @desc page loading failed
				this.tearDown(EXIT_LOAD_FAILED, 'Page loading failed');
				break;
		}
	},

	// debug
	onAlert: function(msg) {
		this.log('Alert: %s', msg);
		this.emitInternal('alert', msg); // @desc the page called window.alert
	},

	onConfirm: function(msg) {
		this.log('Confirm: %s', msg);
		this.emitInternal('confirm', msg); // @desc the page called window.confirm
	},

	onPrompt: function(msg) {
		this.log('Prompt: %s', msg);
		this.emitInternal('prompt', msg); // @desc the page called window.prompt
	},

	onConsoleMessage: function(msg) {
		var prefix, data;

		// split "foo:content"
		prefix = msg.substr(0, 3);
		data = msg.substr(4);

		try {
			data = JSON.parse(data);
		} catch (ex) {
			// fallback to plain log
			prefix = false;
		}

		//console.log(JSON.stringify([prefix, data]));

		switch (prefix) {
			// handle JSON-encoded messages from browser's scope sendMsg()
			case 'msg':
				this.onCallback(data);
				break;

				// console.log arguments are passed as JSON-encoded array
			case 'log':
				msg = this.util.format.apply(this, data);

				this.log('console.log: %s', msg);
				this.emitInternal('consoleLog', msg, data); // @desc the page called console.log
				break;

			default:
				this.log(msg);
		}
	},

	// https://github.com/ariya/phantomjs/wiki/API-Reference-WebPage#oncallback
	onCallback: function(msg) {
		var type = msg && msg.type || '',
			data = msg && msg.data || {};

		switch (type) {
			case 'log':
				this.log.apply(this, data);
				break;

			case 'setMetric':
				this.setMetric(data.name, data.value, data.isFinal);
				break;

			case 'incrMetric':
				this.incrMetric(data.name, data.incr);
				break;

			case 'setMarkerMetric':
				this.setMarkerMetric(data.name);
				break;

			case 'addOffender':
				this.addOffender.apply(this, data);
				break;

			case 'emit':
				this.emit.apply(this, data);
				break;

			default:
				this.log('Message "%s" from browser\'s scope: %j', type, data);
				this.emitInternal('message', msg); // @desc the scope script sent a message
		}
	},

	onError: function(msg, trace) {
		this.emitInternal('jserror', msg, trace); // @desc JS error occured
	},

	// metrics reporting
	setMetric: function(name, value, isFinal) {
		value = typeof value === 'string' ? value : (value || 0); // set to zero if undefined / null is provided
		this.results.setMetric(name, value);

		// trigger an event when the metric value is said to be final (isse #240)
		if (isFinal === true) {
			this.emit('metric', name, value); // @desc the metric is given the final value
		}
	},

	setMetricEvaluate: function(name, fn) {
		this.setMetric(name, this.page.evaluate(fn), true /* isFinal */ );
	},

	setMarkerMetric: function(name) {
		var now = Date.now(),
			value = now - this.responseEndTime;

		if (typeof this.responseEndTime === 'undefined') {
			throw 'setMarkerMetric() called before responseEnd event!';
		}

		this.setMetric(name, value, true /* isFinal */ );
		return value;
	},

	// increements given metric by given number (default is one)
	incrMetric: function(name, incr /* =1 */ ) {
		var currVal = this.getMetric(name) || 0;
		this.setMetric(name, currVal + (typeof incr === 'number' ? incr : 1));
	},

	getMetric: function(name) {
		return this.results.getMetric(name);
	},

	getSource: function() {
		return this.page.content;
	},

	addOffender: function( /**metricName, msg, ... */ ) {
		var args = Array.prototype.slice.call(arguments),
			metricName = args.shift();

		this.results.addOffender(metricName, this.util.format.apply(this, args));
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
			self = this;

		if (typeof args === 'function') {
			callback = args;
		}

		// execFile(file, args, options, callback)
		// @see https://github.com/ariya/phantomjs/wiki/API-Reference-ChildProcess
		args = args || [];
		script = this.dir + script;

		// always wait for runScript to finish (issue #417)
		this.reportQueue.push(function(done) {
			var ctx, pid;

			ctx = execFile(script, args, null, function(err, stdout, stderr) {
				var time = Date.now() - start;

				if (err || stderr) {
					self.log('runScript: pid #%d failed - %s (took %d ms)!', pid, (err || stderr || 'unknown error').trim(), time);
				} else if (!pid) {
					self.log('runScript: failed running %s %s!', script, args.join(' '));

					done();
					return;
				} else {
					self.log('runScript: pid #%d done (took %d ms)', pid, time);
				}

				// (try to) parse JSON-encoded output
				try {
					callback(null, JSON.parse(stdout));
				} catch (ex) {
					self.log('runScript: JSON parsing failed!');
					callback(stderr, stdout);
				}

				done();
			});

			pid = ctx.pid;

			if (pid) {
				self.log('runScript: %s %s (pid #%d)', script, args.join(' '), pid);
			} else {
				done();
			}
		});
	},

	// return temporary directory for the current phantomas run
	// passed as PHANTOMAS_TMP_DIR environment variable by phantomas' node.js runner
	tmpdir: function() {
		// example: /tmp/phantomas/58aea8b5-2c97-48ee-9885-fcd81d38561f/
		return require('system').env.PHANTOMAS_TMP_DIR;
	}
};

module.exports = phantomas;
