/**
 * Adds CSS related metrics using analyze-css NPM module
 *
 * @see https://github.com/macbre/analyze-css
 *
 * Run phantomas with --analyze-css option to use this module
 *
 * setMetric('cssBase64Length') @desc total length of base64-encoded data in CSS source (will warn about base64-encoded data bigger than 4 kB) @optional @offenders
 * setMetric('cssRedundantBodySelectors') @desc number of redundant body selectors (e.g. body .foo, section body h2, but not body > h1) @optional @offenders
 * setMetric('redundantChildNodesSelectors') @desc number of redundant child nodes selectors @optional @offenders
 * setMetric('cssComments') @desc number of comments in CSS source @optional @offenders
 * setMetric('cssCommentsLength') @desc length of comments content in CSS source @optional
 * setMetric('cssComplexSelectors') @desc number of complex selectors (consisting of more than three expressions, e.g. header ul li .foo) @optional @offenders
 * setMetric('cssComplexSelectorsByAttribute') @desc  [number] number of selectors with complex matching by attribute (e.g. [class$="foo"]) @optional @offenders
 * setMetric('cssDuplicatedSelectors') @desc number of CSS selectors defined more than once in CSS source @optional @offenders
 * setMetric('cssDuplicatedProperties') @desc number of CSS property definitions duplicated within a selector @optional @offenders
 * setMetric('cssEmptyRules') @desc number of rules with no properties (e.g. .foo { }) @optional @offenders
 * setMetric('cssExpressions') @desc number of rules with CSS expressions (e.g. expression( document.body.clientWidth > 600 ? "600px" : "auto" )) @optional @offenders
 * setMetric('cssOldIEFixes') @desc number of fixes for old versions of Internet Explorer (e.g. * html .foo {} and .foo { *zoom: 1 }) @optional @offenders
 * setMetric('cssImports') @desc number of @import rules @optional @offenders
 * setMetric('cssImportants') @desc number of properties with value forced by !important @optional @offenders
 * setMetric('cssMediaQueries') @desc number of media queries (e.g. @media screen and (min-width: 1370px)) @optional @offenders
 * setMetric('cssOldPropertyPrefixes') @desc number of properties with no longer needed vendor prefix, powered by data provided by autoprefixer (e.g. --moz-border-radius) @optional @offenders
 * setMetric('cssQualifiedSelectors') @desc number of qualified selectors (e.g. header#nav, .foo#bar, h1.title) @optional @offenders
 * setMetric('cssSpecificityIdAvg') @desc average specificity for ID @optional
 * setMetric('cssSpecificityIdTotal') @desc total specificity for ID @optional
 * setMetric('cssSpecificityClassAvg') @desc average specificity for class, pseudo-class or attribute @optional
 * setMetric('cssSpecificityClassTotal') @desc total specificity for class, pseudo-class or attribute @optional
 * setMetric('cssSpecificityTagAvg') @desc average specificity for element @optional
 * setMetric('cssSpecificityTagTotal') @desc total specificity for element @optional
 * setMetric('cssSelectorsByAttribute') @desc number of selectors by attribute (e.g. .foo[value=bar]) @optional
 * setMetric('cssSelectorsByClass') @desc number of selectors by class @optional
 * setMetric('cssSelectorsById') @desc number of selectors by ID @optional
 * setMetric('cssSelectorsByPseudo') @desc number of pseudo-selectors (e,g. :hover) @optional
 * setMetric('cssSelectorsByTag') @desc number of selectors by tag name @optional
 * setMetric('cssUniversalSelectors') @desc number of selectors trying to match every element (e.g. .foo > *) @optional @offenders
 * setMetric('cssLength') @desc length of CSS source (in bytes) @optional
 * setMetric('cssRules') @desc number of rules (e.g. .foo, .bar { color: red } is counted as one rule) @optional
 * setMetric('cssSelectors') @desc number of selectors (e.g. .foo, .bar { color: red } is counted as two selectors - .foo and .bar) @optional
 * setMetric('cssDeclarations') @desc number of declarations (e.g. .foo, .bar { color: red } is counted as one declaration - color: red) @optional
 */
/* global document: true, window: true */
'use strict';

exports.version = '0.4';

exports.module = function(phantomas) {
	if (!phantomas.getParam('analyze-css')) {
		phantomas.log('To enable CSS in-depth metrics please run phantomas with --analyze-css option');
		return;
	}

	phantomas.setMetric('cssParsingErrors'); // @desc number of CSS files (or embeded CSS) that failed to be parse by analyze-css @optional
	phantomas.setMetric('cssInlineStyles'); // @desc number of inline styles @optional

	function ucfirst(str) {
		// http://kevin.vanzonneveld.net
		// +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
		// +   bugfixed by: Onno Marsman
		// +   improved by: Brett Zamir (http://brett-zamir.me)
		// *     example 1: ucfirst('kevin van zonneveld');
		// *     returns 1: 'Kevin van zonneveld'
		str += '';
		var f = str.charAt(0).toUpperCase();
		return f + str.substr(1);
	}

	// run analyze-css "binary" installed by npm
	function analyzeCss(options) {
		var isWindows = (require('system').os.name === 'windows'),
			binary = isWindows ? 'analyze-css.cmd' : 'analyze-css';

		// force JSON output format
		options.push('--json');

		phantomas.runScript('node_modules/.bin/' + binary, options, function(err, results) {
			if (err !== null) {
				phantomas.log('analyzeCss: sub-process failed!');

				// report failed CSS parsing (issue #494(
				var offender = (options[0] === '--url') ? options[1] : '<inline CSS>';
				if (err.indexOf('CSS parsing failed') > 0) {
					offender += ' (' + err.trim() + ')';
				} else if (err.indexOf('Empty CSS was provided') > 0) {
					offender += ' (Empty CSS was provided)';
				}

				phantomas.incrMetric('cssParsingErrors');
				phantomas.addOffender('cssParsingErrors', offender);
				return;
			}

			phantomas.log('analyzeCss: using ' + results.generator);

			var metrics = results.metrics || {},
				offenders = results.offenders || {};

			Object.keys(metrics).forEach(function(metric) {
				var metricPrefixed = 'css' + ucfirst(metric);

				// increase metrics
				phantomas.incrMetric(metricPrefixed, metrics[metric]);

				// and add offenders
				if (typeof offenders[metric] !== 'undefined') {
					offenders[metric].forEach(function(msg) {
						phantomas.addOffender(metricPrefixed, msg);
					});
				}
			});
		});
	}

	phantomas.on('recv', function(entry, res) {
		if (entry.isCSS) {
			phantomas.log('CSS: analyzing <%s>...', entry.url);
			analyzeCss(['--url', entry.url]);
		}
	});

	phantomas.on('loadFinished', function() {
		var fs = require('fs');

		// get the content of inline CSS (issue #397)
		var inlineCss = phantomas.evaluate(function() {
			return (function(phantomas) {
				phantomas.spyEnabled(false, 'looking for inline styles');

				var styles = document.getElementsByTagName('style'),
					content = [];

				for (var i = 0, len = styles.length; i < len; i++) {
					content.push(styles[i].textContent);
				}

				phantomas.spyEnabled(true);
				return content;
			})(window.__phantomas);
		});

		// no inline styles found, leave
		if (inlineCss.length === 0) {
			return;
		}

		phantomas.log('analyzeCss: found %d inline styles', inlineCss.length);
		phantomas.setMetric('cssInlineStyles', inlineCss.length);

		// create the temporary directory
		fs.makeTree(phantomas.tmpdir());

		inlineCss.forEach(function(cssContent, idx) {
			var path = phantomas.tmpdir() + 'inline-' + idx + '.css';

			phantomas.log('analyzeCss: saving inline CSS #%d to %s (%d bytes)...', (idx + 1), path, cssContent.length);

			// save CSS to the file
			fs.write(path, cssContent, 'w');

			analyzeCss(['--file', path]);
		});
	});
};
