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

	phantomas.injectJs('dommonster.js');

	phantomas.on('loadFinished', function() {
		phantomas.setMetricEvaluate('bodyHTMLSize', function() {
			return document.body.outerHTML.length;
		});
	});
};
