/**
 * Analyzes DOM complexity
 *
 * Uses dom-monster bookmarklet
 *
 * @see http://mir.aculo.us/dom-monster
 * @see https://github.com/madrobby/dom-monster
 */
exports.version = '0.1';

exports.module = function(phantomas) {

	// inject DOM Monster
	phantomas.on('report', function() {
		var injectRes = phantomas.injectJs('./lib/dommonster.js');
		phantomas.log(injectRes ? 'DOM monster injected' : 'Unable to inject DOM monster!');
	});

	phantomas.on('report', function() {
		// JS global variables
		var globalVariables = phantomas.evaluate(function() {
			return JR.globals();
		});

		phantomas.setMetric('globalVariables', globalVariables.length);
		phantomas.addNotice('JavaScript globals (' + (globalVariables.length) + '): ' + globalVariables.join(', '));

		// HTML size
		phantomas.setMetricEvaluate('bodyHTMLSize', function() {
			return document.body.outerHTML.length;
		});
	});
};
