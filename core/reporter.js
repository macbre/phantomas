/**
 * Reporters factory
 *
 * All reporters are defined in /reporters directory
 * and are provided with run results and command line options
 */
'use strict';

module.exports = function(results, options) {
	var debug = require('debug')('phantomas:reporter'),
		reporterName,
		reporterOptions,
		reporterPath,
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

	// make the results "flat" - i.e. single run mode
	if (Array.isArray(results)) {
		if (results.length === 1) {
			debug('Single run mode');
			results = results[0];
		} else {
			debug('Multiple runs mode');
			inMultipleMode = true;
		}
	}

	// load the reporter
	reporterPath = '../reporters/' + reporterName;

	try {
		reporter = new(require(reporterPath))(results, reporterOptions, options);
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
