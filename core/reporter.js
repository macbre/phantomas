/**
 * Reporters factory
 */
'use strict';

module.exports = function(results, options) {
	var debug = require('debug')('phantomas:reporter'),
		format = options.format,
		formatterPath = '../reporters/' + format,
		formatter;

	debug('Setting up %s reporter...', format);

	try {
		formatter = new (require(formatterPath))(results, options);
	}
	catch(ex) {
		throw new Error('Reporter "' + format + '" is not supported!');
	}

	debug('Done');

	// public interface
	return {
		render: function() {
			return formatter.render();
		}
	};
};
