/**
 * Analyzes jQuery activity
 *
 * @see http://code.jquery.com/jquery-1.10.2.js
 * @see http://code.jquery.com/jquery-2.1.1.js
 */
/* global document: true, window: true */
'use strict';

module.exports = function(phantomas) {
	var lastUrl;

	phantomas.setMetric('jQueryVersion', ''); // @desc version of jQuery framework (if loaded) [string]
	phantomas.setMetric('jQueryVersionsLoaded'); // @desc number of loaded jQuery "instances" (even in the same version)
	phantomas.setMetric('jQueryOnDOMReadyFunctions'); // @desc number of functions bound to onDOMReady event
	phantomas.setMetric('jQueryWindowOnLoadFunctions'); // @desc number of functions bound to windowOnLoad event
	phantomas.setMetric('jQuerySizzleCalls'); // @desc number of calls to Sizzle (including those that will be resolved using querySelectorAll)
	phantomas.setMetric('jQueryEventTriggers'); // @desc number of jQuery event triggers
	phantomas.setMetric('jQueryDOMReads'); // @desc number of DOM read operations
	phantomas.setMetric('jQueryDOMWrites'); // @desc number of DOM write operations
	phantomas.setMetric('jQueryDOMWriteReadSwitches'); // @desc number of read operations that follow a series of write operations (will cause repaint and can cause reflow)

	// inject JS code
	phantomas.on('init', () => phantomas.injectJs(__dirname + '/scope.js'));

	// store the last resource that was received
	// try to report where given jQuery version was loaded from
	phantomas.on('recv', entry => {
		if (entry.isJS) {
			lastUrl = entry.url;
		}
	});

	phantomas.on('jQueryLoaded', version => {
		phantomas.setMetric('jQueryVersion', version);

		// report multiple jQuery "instances" (issue #435)
		phantomas.incrMetric('jQueryVersionsLoaded');
		phantomas.addOffender('jQueryVersionsLoaded', {version: version, url: lastUrl});

		phantomas.log('jQuery: v%s (probably loaded from <%s>)', version, lastUrl);
	});

	// jQuery read & write operations (issue #436)
	var lastOp;

	phantomas.on('jQueryOp', (type, functionName, args, contextPath, caller) => {
		const offenderDetails = {functionName, arguments: JSON.stringify(args), contextPath};

		phantomas.log('jQuery: %s op from $.%s(%j) on "%s" - %s', type, functionName, args, contextPath, caller);

		if (type === 'read') {
			phantomas.incrMetric('jQueryDOMReads');
			phantomas.addOffender('jQueryDOMReads', offenderDetails);

			// This read operation may follow a write operation
			// In this case browser needs to perform all buffered write operations
			// in order to update the DOM - this can cause repaints and reflows
			if (lastOp === 'write') {
				phantomas.incrMetric('jQueryDOMWriteReadSwitches');
				phantomas.addOffender('jQueryDOMWriteReadSwitches', offenderDetails);
			}
		} else {
			phantomas.incrMetric('jQueryDOMWrites');
			phantomas.addOffender('jQueryDOMWrites', offenderDetails);
		}

		lastOp = type;
	});
};
