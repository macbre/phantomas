#!/usr/bin/env node
var program = require('commander');

function analyzeCss(css) {
	var cssParser = require('css-parse'),
		slickParse = require('slick/Source/Slick.Parser.js').Slick.parse,
		tree = new cssParser(css),
		rules = tree && tree.stylesheet.rules,
		regExp = {
			oldIEFixes: /^\*/
		},
		results,
		messages = [];

	// helper functions
	function formatCssSnippet(rule, declaration) {
		return rule.selectors.join(', ') + ' { [[' + declaration.property + ': ' + declaration.value +  ']]; }';
	}

	// selectors longer than value below will be treated as complex ones
	var COMPLEX_SELECTOR_THRESHOLD = 3;

	if (!rules instanceof Array) {
		return false;
	}

	//console.log(JSON.stringify(rules, undefined, 2)); process.exit(1);

	// initialize stats
	results = {
		cssLength: css.length,
		selectorsTotal: 0,
		selectorsPartsTotal: 0,
		declarationsTotal: 0,
		complexSelectors: 0,
		qualifiedRules: 0,
		oldIEFixes: 0,
		selectorsByTag: 0,
		selectorsByWildcard: 0,
		selectorsByClass: 0,
		selectorsById: 0,
		selectorsByPseudo: 0,
		selectorsByAttribute: 0,
		selectorsByAttributeComplex: 0,
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

					//console.log(JSON.stringify([selector, expressions], undefined, 2));

					results.selectorsPartsTotal += parsedSelector.expressions[0].length;

					expressions.forEach(function(expr) {
						var hasTag, hasClass, hasId, hasPseudo;

						if (expr.tag) {
							// a
							if (expr.tag !== '*') {
								results.selectorsByTag++;
								hasTag = true;
							}
							// nav *
							else {
								// {"combinator": " ","tag": "*"}
								if (Object.keys(expr).length === 2) {
									results.selectorsByWildcard++;
									messages.push('Selector by wildcard: ' + selector);
								}
							}
						}

						// .foo
						if (expr.classList) {
							results.selectorsByClass++;
							hasClass = true;
						}

						// #bar
						if (expr.id) {
							results.selectorsById++;
							hasId = true;
						}

						// :hover
						if (expr.pseudos) {
							results.selectorsByPseudo++;
							hasPseudo = true;
						}

						// .foo[type=bar]
						// @see http://www.w3.org/TR/css3-selectors/#attribute-selectors
						if (expr.attributes) {
							results.selectorsByAttribute++;

							switch(expr.attributes[0].operator) {
								case '=':
									break;

								case '~=': // contains value in a whitespace-separated list of words
								case '|=': // starts with value or value-
								case '^=': // starts with
								case '$=': // ends with
								case '*=': // contains
									results.selectorsByAttributeComplex++;
									messages.push('Selector by attribute (complex): ' + selector);
									break;
							}
						}

						// qualified rules
						if (
							// foo#id
							(hasId && hasTag) ||
							// .foo#id
							(hasId && hasClass) ||
							// foo.class
							(hasClass && hasTag)
						) {
							results.qualifiedRules++;

							messages.push('Qualified rule: ' + selector);
						}
					});

					// log complex selectors
					if (expressions.length > COMPLEX_SELECTOR_THRESHOLD) {
						messages.push('Complex selector: ' + selector);
						results.complexSelectors++;
					}
				});

				// parse all rules
				rule.declarations.forEach(function(declaration) {
					if (declaration.property) {
						// foo: bar !important
						if (declaration.value.indexOf('!important') > -1) {
							messages.push('!important found: ' + formatCssSnippet(rule, declaration));
							results.importantsTotal++;
						}

						// *foo: bar // IE7- fix - @see http://www.impressivewebs.com/ie7-ie8-css-hacks/
						if (regExp.oldIEFixes.test(declaration.property)) {
							messages.push('Fix for old IE found: ' + formatCssSnippet(rule, declaration));
							results.oldIEFixes++;
						}
					}
				});
				break;
		}
	});

	return {
		results: results,
		messages: messages
	};
}

function runAnalyzer(css, program) {
	var colors = require('ansicolors'),
		bw = program.bw,
		res = analyzeCss(css);

	if (res === false) {
		process.exit(3);
	}

	// emit extra messages
	if (program.verbose && !program.json) {
		res.messages.forEach(function(msg) {
			var idx = msg.indexOf(': '),
				label = msg.substr(0, idx),
				color = 'blue';

			msg = msg.substr(idx);

			// handle --bw option
			if (bw) {
				console.log(label + msg.replace(/\[\[|\]\]/g, ''));
				return;
			}

			// color message label
			switch(label) {
				case 'Qualified rule':       color = 'brightBlue';  break;
				case 'Complex selector':     color = 'green';       break;
				case '!important found':     color = 'red';         break;
				case 'Fix for old IE found': color = 'yellow';      break;
			}

			// mark message parts wrapped in [[ .. ]]
			msg = msg.replace(/\[\[(.*)\]\]/g, function(match) {
				return colors.bgWhite(colors.black(match.substring(2, match.length - 2)));
			});

			console.log(colors[color](label) + msg);
		});
	}

	// format output
	if (program.json) {
		console.log(JSON.stringify(res.results));
	}
	else {
		Object.keys(res.results).forEach(function(key) {
			console.log( key + ' = ' + res.results[key] );
		});
	}
}

// parse command line options
program
	.version('0.2')
	.option('--url [value]', 'CSS to fetch and analyze')
	.option('--file [value]', 'Local CSS file to analyze')
	.option('--json', 'Format results as JSON and don\'t emit any addiitonal messages (i.e. supressed --json)')
	.option('--verbose', 'Be verbose by emitting additonal messages')
	.option('--bw', 'Don\'t apply ANSI colors to additional messages')
	.parse(process.argv);

// analyze local file
if (program.file) {
	var css = require('fs').readFileSync(program.file.toString()).toString();
	runAnalyzer(css, program);
}
else if (typeof program.url == 'string') {
	var request = require('request');

	request(program.url, function(err, resp, body) {
		if (err || resp.statusCode !== 200) {
			console.log('Request for <' + program.url + '> failed: ' + (err ? err : 'HTTP response code #' + resp.statusCode));
			process.exit(2);
		}
		else {
			runAnalyzer(body, program);
		}
	});
}
else {
	program.help();
	process.exit(1);
}
