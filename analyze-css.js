#!/usr/bin/env node
/* jshint node: true */

var program = require('commander');

function analyzeCss(css) {
	var cssParser = require('css-parse'),
		tree = new cssParser(css),
		rules = tree && tree.stylesheet.rules,
		results;

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
		importantsTotal: 0
	};

	// itterate over AST
	rules.forEach(function(rule) {
		switch(rule.type) {
			case 'rule':
				results.selectorsTotal += rule.selectors.length;
				results.declarationsTotal += rule.declarations.length;

				rule.selectors.forEach(function(selector) {
					results.selectorsPartsTotal += selector.split(' ').length;
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
