/**
 * Extends optimist with support for JSON/YAML config file
 *
 * Pass a path to the config file using --config option
 *
 * @see https://github.com/substack/node-optimist
 * @see https://github.com/substack/minimist
 */
var debug = require('debug')('optimist:config'),
	fs = require('fs'),
	optimist = require('optimist'),
	yaml = require('js-yaml');

function parseConfigFile(configFileName) {
	var raw,
		configMode,
		configParsed;

	debug('using "%s" config file', configFileName);

	// check the existance of the config file
	if (!fs.existsSync(configFileName)) {
		throw 'Config file "' + configFileName + '" cannot be found!';
	}

	// JSON or YAML?
	configMode = /\.yaml$/.test(configFileName) ? 'YAML' : 'JSON';

	// parse it
	try {
		raw = fs.readFileSync(configFileName).toString();

		switch (configMode) {
			case 'YAML':
				configParsed = yaml.safeLoad(raw);
				break;

			case 'JSON':
				configParsed = JSON.parse(raw);
				break;
		}
	} catch (e) {
		debug('%s config file parsing failed (%s)', configMode, e);
		throw configMode + '%s config file parsing failed (' + e + ')';
	}

	// convert nested objects into options
	// {'foo':{'bar': 1}} -> --foo--bar 1
	Object.keys(configParsed).forEach(function(key) {
		var value = configParsed[key];

		if (typeof value === 'object' && !Array.isArray(value)) {
			delete configParsed[key];

			// remove plural suffix
			key = key.replace(/s$/, '');

			debug('unwrapping --%s-* options...', key);

			Object.keys(value).forEach(function(subKey) {
				configParsed[key + '-' + subKey] = value[subKey];
			});
		}
	});

	debug('%s config file parsed: %j', configMode, configParsed);
	return configParsed;
}

// extend optimist
var origParse = optimist.parse;

optimist.parse = function(args) {
	var options = origParse(args);
	debug('parse: %j', args);

	// check the config file
	var configFileName = this.configFileParam && options[this.configFileParam],
		configParsed;

	// if --config is not provided, quit
	if (!configFileName) {
		debug('options: %j', options);
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

	debug('options: %j', options);
	return options;
};

optimist.setConfigFile = function(configFileParam) {
	this.configFileParam = configFileParam;
	return this.describe(this.configFileParam, 'uses JSON or YAML-formatted config file to set parameters').string(this.configFileParam);
};

module.exports = optimist;
