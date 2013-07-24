#!/usr/bin/env node
/* jshint node: true */

var program = require('commander');

function analyzeCss(css) {
	var cssParser = require('css-parse'),
		slickParse = require('slick').Slick.parse,
		tree = new cssParser(css),
		rules = tree && tree.stylesheet.rules,
		results;

	// selectors longer than value below will be treated as complex ones
	var COMPLEX_SELECTOR_THRESHOLD = 3;

	if (!rules instanceof Array) {
		return false;
	}

	//console.log(rules);

	// initialize stats
	results = {
		cssLength: css.length,
		selectorsTotal: 0,
		selectorsPartsTotal: 0,
		declarationsTotal: 0,
		complexSelectors: 0,
		selectorsByTag: 0,
		selectorsByClass: 0,
		selectorsById: 0,
		selectorsByPseudo: 0,
		importantsTotal: 0
	};

	// itterate over AST
	rules.forEach(function(rule) {
		switch(rule.type) {
			case 'rule':
				results.selectorsTotal += rule.selectors.length;
				results.declarationsTotal += rule.declarations.length;

				// parse each selector
				rule.selectors.forEach(function(selector) {
					var parsedSelector = slickParse(selector),
						expressions = parsedSelector.expressions[0];

					//console.log([selector, expressions]);

					results.selectorsPartsTotal += parsedSelector.expressions[0].length;

					expressions.forEach(function(expr) {
						// a
						if (expr.tag && expr.tag !== '*') {
							results.selectorsByTag++;
						}

						// .foo
						if (expr.classList) {
							results.selectorsByClass++;
						}

						// #bar
						if (expr.id) {
							results.selectorsById++;
						}

						// :hover
						if (expr.pseudos) {
							results.selectorsByPseudo++;
						}
					});

					// log complex selectors
					if (expressions.length > COMPLEX_SELECTOR_THRESHOLD) {
						console.log(selector);
						results.complexSelectors++;
					}
				});

				rule.declarations.forEach(function(declaration) {
					if (declaration.property) {
						if (declaration.value.indexOf('!important') > -1) {
							results.importantsTotal++;
						}
					}
				});
				break;
		}
	});

	return results;
}

// parse command line options
program
	.version('0.0.1')
	.option('--url [value]', 'CSS to fetch and analyze')
	.option('--file [value]', 'Local CSS file to analyze')
	.option('--json', 'Format results as JSON')
	.parse(process.argv);

// analyze local file
if (program.file) {
	var css = require('fs').readFileSync(program.file.toString()).toString(),
		results = analyzeCss(css);

	console.log(results);
}
else {
	program.help();
}
