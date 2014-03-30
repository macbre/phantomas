/**
 * Meters number of invocations of window.alert, window.confirm, and
 * window.prompt.
 */
'use strict';

exports.version = '0.1';

exports.module = function(phantomas) {
	var alerts = [],
		confirms = [],
		prompts = [];

	phantomas.on('alert', function(msg) {
		alerts.push(msg);
	});

	phantomas.on('confirm', function(msg) {
		confirms.push(msg);
	});

	phantomas.on('prompt', function(msg) {
		prompts.push(msg);
	});

	phantomas.on('report', function() {
		phantomas.setMetric('windowAlerts', alerts.length); // @desc number of calls to window.alert
		phantomas.setMetric('windowConfirms', confirms.length); // @desc number of calls to window.confirm
		phantomas.setMetric('windowPrompts', prompts.length); // @desc number of calls to window.prompt
	});
};
