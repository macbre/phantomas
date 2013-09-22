/**
 * Meters number of invocations of window.alert, window.confirm, and
 * window.prompt.
 */

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
		phantomas.setMetric('windowAlerts', alerts.length);
		phantomas.setMetric('windowConfirms', confirms.length);
		phantomas.setMetric('windowPrompts', prompts.length);
	});
};
