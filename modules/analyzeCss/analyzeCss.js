/**
 * Adds CSS complexity metrics using analyze-css npm module.
 *
 * Run phantomas with --analyze-css option to use this module
 *
 * setMetric('cssBase64Length') @desc total length of base64-encoded data in CSS source (will warn about base64-encoded data bigger than 4 kB) @optional @offenders
 * setMetric('cssRedundantBodySelectors') @desc number of redundant body selectors (e.g. body .foo, section body h2, but not body > h1) @optional @offenders
 * setMetric('redundantChildNodesSelectors') @desc number of redundant child nodes selectors @optional @offenders
 * setMetric('cssColors') @desc number of unique colors used in CSS @optional @offenders
 * setMetric('cssComments') @desc number of comments in CSS source @optional @offenders
 * setMetric('cssCommentsLength') @desc length of comments content in CSS source @optional
 * setMetric('cssComplexSelectorsByAttribute') @desc  [number] number of selectors with complex matching by attribute (e.g. [class$="foo"]) @optional @offenders
 * setMetric('cssDuplicatedSelectors') @desc number of CSS selectors defined more than once in CSS source @optional @offenders
 * setMetric('cssDuplicatedProperties') @desc number of CSS property definitions duplicated within a selector @optional @offenders
 * setMetric('cssEmptyRules') @desc number of rules with no properties (e.g. .foo { }) @optional @offenders
 * setMetric('cssExpressions') @desc number of rules with CSS expressions (e.g. expression( document.body.clientWidth > 600 ? "600px" : "auto" )) @optional @offenders
 * setMetric('cssOldIEFixes') @desc number of fixes for old versions of Internet Explorer (e.g. * html .foo {} and .foo { *zoom: 1 }) @optional @offenders
 * setMetric('cssImports') @desc number of @import rules @optional @offenders
 * setMetric('cssImportants') @desc number of properties with value forced by !important @optional @offenders
 * setMetric('cssMediaQueries') @desc number of media queries (e.g. @media screen and (min-width: 1370px)) @optional @offenders
 * setMetric('cssMultiClassesSelectors') @desc number of selectors with multiple classes (e.g. span.foo.bar) @optional @offenders
 * setMetric('cssOldPropertyPrefixes') @desc number of properties with no longer needed vendor prefix, powered by data provided by autoprefixer (e.g. --moz-border-radius) @optional @offenders
 * setMetric('cssQualifiedSelectors') @desc number of qualified selectors (e.g. header#nav, .foo#bar, h1.title) @optional @offenders
 * setMetric('cssSpecificityIdAvg') @desc average specificity for ID @optional @offenders
 * setMetric('cssSpecificityIdTotal') @desc total specificity for ID @optional
 * setMetric('cssSpecificityClassAvg') @desc average specificity for class, pseudo-class or attribute @optional @offenders
 * setMetric('cssSpecificityClassTotal') @desc total specificity for class, pseudo-class or attribute @optional
 * setMetric('cssSpecificityTagAvg') @desc average specificity for element @optional @offenders
 * setMetric('cssSpecificityTagTotal') @desc total specificity for element @optional
 * setMetric('cssSelectorsByAttribute') @desc [number] number of selectors by attribute (e.g. .foo[value=bar]) @optional
 * setMetric('cssSelectorsByClass') @desc number of selectors by class @optional
 * setMetric('cssSelectorsById') @desc number of selectors by ID @optional
 * setMetric('cssSelectorsByPseudo') @desc number of pseudo-selectors (e,g. :hover) @optional
 * setMetric('cssSelectorsByTag') @desc number of selectors by tag name @optional
 * setMetric('cssLength') @desc length of CSS source (in bytes) @optional @offenders
 * setMetric('cssRules') @desc number of rules (e.g. .foo, .bar { color: red } is counted as one rule) @optional @offenders
 * setMetric('cssSelectors') @desc number of selectors (e.g. .foo, .bar { color: red } is counted as two selectors - .foo and .bar) @optional @offenders
 * setMetric('cssDeclarations') @desc number of declarations (e.g. .foo, .bar { color: red } is counted as one declaration - color: red) @optional @offenders
 * setMetric('cssNotMinified') @desc [number] set to 1 if the provided CSS is not minified @optional @offenders
 * setMetric('cssSelectorLengthAvg') @desc [number] average length of selector (e.g. for ``.foo .bar, #test div > span { color: red }`` will be set as 2.5) @optional @offenders
 */
"use strict";

module.exports = function (phantomas) {
  if (phantomas.getParam("analyze-css") !== true) {
    phantomas.log(
      "To enable CSS in-depth metrics please run phantomas with --analyze-css option"
    );
    return;
  }

  // load analyze-css module
  // https://www.npmjs.com/package/analyze-css
  const analyzer = require("analyze-css");
  phantomas.log("Using version %s", analyzer.version);

  phantomas.setMetric("cssParsingErrors"); // @desc number of CSS files (or embeded CSS) that failed to be parse by analyze-css @optional
  phantomas.setMetric("cssInlineStyles"); // @desc number of inline styles @optional

  function ucfirst(str) {
    // http://kevin.vanzonneveld.net
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   bugfixed by: Onno Marsman
    // +   improved by: Brett Zamir (http://brett-zamir.me)
    // *     example 1: ucfirst('kevin van zonneveld');
    // *     returns 1: 'Kevin van zonneveld'
    str += "";
    var f = str.charAt(0).toUpperCase();
    return f + str.substr(1);
  }

  async function analyzeCss(css, context) {
    /**
		// force JSON output format
		options.push('--json');

		// set basic auth if needed
		if (phantomas.getParam('auth-user') && phantomas.getParam('auth-pass')) {
			options.push('--auth-user', phantomas.getParam('auth-user'));
			options.push('--auth-pass', phantomas.getParam('auth-pass'));
		}

		// HTTP proxy (#500)
		var proxy = phantomas.getParam('proxy', false, 'string');

		if (proxy !== false) {
			if (proxy.indexOf('http:') < 0) {
				proxy = 'http://' + proxy; // http-proxy-agent (used by analyze-css) expects a protocol as well
			}

			options.push('--proxy', proxy);
		}
		**/

    // https://www.npmjs.com/package/analyze-css#commonjs-module
    var options = {};
    let results;

    try {
      results = await analyzer(css, options);
    } catch (err) {
      phantomas.log("analyzeCss: sub-process failed! - %s", err);

      // report failed CSS parsing (issue #494(
      var offender = offenderSrc;
      if (err.message) {
        // Error object returned
        if (err.message.indexOf("Unable to parse JSON string") > 0) {
          offender += " (analyzeCss output error)";
        }
      } else {
        // Error string returned (stderror)
        if (
          err.indexOf("CSS parsing failed") > 0 ||
          err.indexOf("is an invalid expression") > 0
        ) {
          offender += " (" + err.trim() + ")";
        } else if (err.indexOf("Empty CSS was provided") > 0) {
          offender += " (Empty CSS was provided)";
        }
      }

      phantomas.incrMetric("cssParsingErrors");
      phantomas.addOffender("cssParsingErrors", offender);
      return;
    }

    var offenderSrc = context || "[inline CSS]";

    phantomas.log("Got results for %s from %s", offenderSrc, results.generator);

    const metrics = results.metrics,
      offenders = results.offenders;

    Object.keys(metrics).forEach((metric) => {
      var metricPrefixed = "css" + ucfirst(metric);

      if (/Avg$/.test(metricPrefixed)) {
        // update the average value (see #641)
        phantomas.addToAvgMetric(metricPrefixed, metrics[metric]);
      } else {
        // increase metrics
        phantomas.incrMetric(metricPrefixed, metrics[metric]);
      }

      // and add offenders
      if (typeof offenders[metric] !== "undefined") {
        offenders[metric].forEach(function (msg) {
          phantomas.addOffender(metricPrefixed, {
            url: offenderSrc,
            value: msg,
          });
        });
      }
      // add more offenders (#578)
      else {
        switch (metricPrefixed) {
          case "cssLength":
          case "cssRules":
          case "cssSelectors":
          case "cssDeclarations":
          case "cssNotMinified":
          case "cssSelectorLengthAvg":
          case "cssSpecificityIdAvg":
          case "cssSpecificityClassAvg":
          case "cssSpecificityTagAvg":
            phantomas.addOffender(metricPrefixed, {
              url: offenderSrc,
              value: metrics[metric],
            });
            break;
        }
      }
    });
  }

  // prepare a list of CSS stylesheets (both external and inline)
  var stylesheets = [];

  phantomas.on("recv", async (entry, res) => {
    if (entry.isCSS) {
      // defer getting the response content and pass it to the analyze-css module
      stylesheets.push({ content: res.getContent, url: entry.url });
    }
  });

  phantomas.on("inlinecss", (css) => stylesheets.push({ inline: css }));

  // ok, now let's analyze the collect CSS
  phantomas.on("beforeClose", () => {
    const promises = [];

    stylesheets.forEach((entry) => {
      promises.push(
        new Promise(async (resolve) => {
          let css = entry.inline;
          phantomas.log("Analyzing %s", entry.url || "inline CSS");

          if (entry.content) {
            css = await entry.content();
          }

          if (css) {
            await analyzeCss(css, entry.url);
          }

          resolve();
        })
      );
    });

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
    return Promise.all(promises);
  });
};
