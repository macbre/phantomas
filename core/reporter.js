/**
 * Reporters factory
 *
 * All reporters are defined in /reporters directory
 * and are provided with run results and command line options
 */
'use strict';

module.exports = function(results, options) {
	var debug = require('debug')('phantomas:reporter'),
		name = options.reporter,
		reporterPath = '../reporters/' + name,
		reporter;

	debug('Setting up %s reporter...', name);

	try {
		reporter = new (require(reporterPath))(results, options);
	}
	catch(ex) {
		debug('Failed: %s', ex);
		throw new Error('Reporter "' + name + '" is not supported!');
	}

	debug('Done');

	// public interface
	return {
		render: function(doneFn) {
			return reporter.render(doneFn);
		}
	};
};
