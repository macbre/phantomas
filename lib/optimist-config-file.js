/**
 * Extends optimist with support for JSON config file
 *
 * Pass a path to the config file using --config option
 *
 * @see https://github.com/substack/node-optimist
 * @see https://github.com/substack/minimist
 */
var debug = require('debug')('optimist:config'),
	fs = require('fs'),
	optimist = require('optimist');

function parseConfigFile(configFileName) {
	var json,
		configParsed;

	debug('Using "%s" config file', configFileName);

	// check the existance of the config file
	if (!fs.existsSync(configFileName)) {
		throw 'Config file "' + configFileName + '" cannot be found!';
	}

	// parse it
	try {
		json = fs.readFileSync(configFileName).toString();
		configParsed = JSON.parse(json);
	}
	catch(e) {
		debug('Config file parsing failed (%s)', e);
		throw 'Config file parsing failed (' + e + ')';
	}

	// convert nested objects into options
	// {'foo':{'bar': 1}} -> --foo--bar 1
	Object.keys(configParsed).forEach(function(key) {
		var value = configParsed[key];

		if (typeof value === 'object' && !Array.isArray(value)) {
			delete configParsed[key];

			// remove plural suffix
			key = key.replace(/s$/, '');

			debug('Unwrapping --%s-... options...', key);

			Object.keys(value).forEach(function(subKey) {
				configParsed[key + '-' + subKey] = value[subKey];
			});
		}
	});

	debug('Config file parsed: %j', configParsed);
	return configParsed;
}

// extend optimist
var origParse = optimist.parse;

optimist.parse = function(args) {
	var options = origParse(args);

	debug('parse: %j', args);
	debug('options: %j', options);

	// check the config file
	var configFileName = this.configFileParam && options[this.configFileParam],
		configParsed;

	// if --config is not provided, quit
	if (!configFileName) {
		return options;
	}

	configParsed = parseConfigFile(configFileName);

	// apply the rest of the options provided via command line
	Object.keys(configParsed).forEach(function(key) {
		// check if given option was not provided via command line
		if (args.indexOf('--' + key) > -1) {
			debug('--%s option provided via command line, will skip the value from config file', key);
			return;
		}

		options[key] = configParsed[key];
	});

	// cleanup
	delete options[this.configFileParam];
	return options;
};

optimist.setConfigFile = function(configFileParam) {
	this.configFileParam = configFileParam;
	return this.describe(this.configFileParam, 'uses JSON-formatted config file to set parameters').string(this.configFileParam);
};

module.exports = optimist;

/**

module.exports = function(program, argv, configParam) {
	configParam = configParam || 'config';

	// add --config parameter to help
	program.describe(configParam, 'uses JSON-formatted config file to set parameters').string(configParam);

	var options = program.parse(argv),
		defaults = program.parse('');

	// get the config file path
	var configFileName = options[configParam],
		configParsed;

	// if --config is not provided, quit
	if (!configFileName) {
		return options;
	}

	configParsed = parseConfigFile(configFileName);

	// go through each option and replace with value coming from command line option
	Object.keys(options).forEach(function(key) {
		if (options[key] !== defaults[key]) {
			configParsed[key] = options[key];
			debug('%s = %s', key, options[key]);
		}
	});

	// cleanup
	delete configParsed[configParam];

	debug('Defaults: %j', defaults);
	debug('Options: %j', configParsed);
	throw 'foo';
	return configParsed;
};
**/
