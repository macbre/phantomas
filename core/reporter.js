/**
 * Reporters factory
 *
 * All reporters are defined in /reporters directory
 * and are provided with run results and command line options
 */
'use strict';

//convenience function to hide the dirty import logic
function _requireReporter(reporterName) {
	var reporter,
		reporterPath = 'phantomas-reporter-' + reporterName;

	try {
		reporter = require(reporterPath);
	} catch (ex) {
		//external reporter doesn't exist yet, try as a "local" reporter
		reporterPath = '../reporters/' + reporterName;
		reporter = require(reporterPath);
	}

	return reporter;
}


module.exports = function(results, options) {
	var debug = require('debug')('phantomas:reporter'),
		reporterName,
		reporterOptions,
		reporter,
		inMultipleMode = false;

	// parse reporter options, examples:
	// -R plain
	// -R csv
	// -R csv:no-header:url:timestamp
	reporterOptions = (options.reporter + '').split(':');
	reporterName = reporterOptions.shift();

	// allow access to options via object.key (for non-numeric values)
	reporterOptions.forEach(function(option) {
		if (!parseInt(option)) {
			reporterOptions[option] = true;
		}
	});

	debug('Setting up %s reporter (options: %j)...', reporterName, reporterOptions);

	if (Array.isArray(results)) {
		debug('Multiple runs mode');
		inMultipleMode = true;
	}

	try {
		reporter = new(_requireReporter(reporterName))(results, reporterOptions, options);
	} catch (ex) {
		debug('Failed: %s', ex);
		throw new Error('Reporter "' + reporterName + '" is not supported!');
	}

	// check handling of multiple runs results
	if (inMultipleMode && reporter.handlesMultiple !== true) {
		throw 'Reporter "' + reporterName + '" does not handle multiple runs!';
	}

	debug('Done');

	// public interface
	return {
		render: function(doneFn) {
			return reporter.render(doneFn);
		}
	};
};
