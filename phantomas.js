/**
 * PhantomJS-based web performance metrics collector
 *
 * Usage:
 *  node phantomas.js
 *    --url=<page to check>
 *    --debug
 *    --verbose
 *
 * @version 0.2
 */

// parse script arguments
var params = require('./lib/args').parse(phantom.args),
	phantomas = require('./core/phantomas').phantomas;

// run phantomas
var instance = new phantomas(params);

// add 3rd party modules
instance.addModule('assetsTypes');
instance.addModule('cacheHits');
instance.addModule('cookies');
instance.addModule('domComplexity');
//instance.addModule('domQueries'); // FIXME: jQuery mockup generates random issues
instance.addModule('domains');
instance.addModule('headers');
instance.addModule('requestsStats');
instance.addModule('localStorage');
instance.addModule('waterfall');
instance.addModule('windowPerformance');

// and finally - run it!
instance.run();
