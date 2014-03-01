#!/usr/bin/env node
/**
 * Generates metrics.json file that stores metrics metadata
 */
'use strict';

var debug = require('debug')('generate'),
	fs = require('fs'),
	glob = require('glob'),
	phantomas = require('../../'),
	util = require('util'),
	metadata = {
		metrics: {},
		count: 0,
		version: phantomas.version
	};

function getModuleMetadata(moduleFile) {
	var content = fs.readFileSync(moduleFile),
		data = {
			metrics: {}
		},
		matches,
		moduleName,
		re =/setMetric\(['"]([^'"]+)['"](\)|,)(.*)(\@desc.*)?$/mg;

	moduleName = moduleFile.split('/').pop().replace(/\.js$/, '');

	// scan the source code
	while ( (matches = re.exec(content)) !== null ) {
		var entry = {},
			metricName = matches[1],
			metricComment = matches[3],
			metricUnit = 'ms';

		if (typeof data.metrics[metricName] !== 'undefined') {
			//debug('Found duplicated definition of %s metric in %s module', metricName, moduleName);
			continue;
		}

		// parse @desc
		if (metricComment && metricComment.indexOf('@desc') > -1) {
			metricComment = metricComment.split('@desc').pop().trim();
			entry.desc = '';

			// mark unreliable metrics
			if (metricComment.indexOf('@unreliable') > -1) {
				entry.unreliable = true;
				metricComment = metricComment.replace('@unreliable', '').trim();
			}

			// detect units (defaults to ms)
			if ( (matches = metricComment.match(/\[(.*)\]/)) !== null) {
				metricUnit = matches[1];
				metricComment = metricComment.replace(matches[0], '').trim();
			}
			else if (/^(number|total number) of/.test(metricComment)) {
				metricUnit = 'number';
			}
			else if (/^(size of)/.test(metricComment)) {
				metricUnit = 'bytes';
			}

			entry.desc = metricComment;
			entry.unit = metricUnit;
		}
		else {
			debug('Metadata missing for %s metric in %s module', metricName, moduleName);
		}

		entry.module = moduleName;

		// add a metric
		data.metrics[metricName] = entry;
	}

	return data;
}

// find all modules
var dir = phantomas.path;
debug('Looking for modules in %s...', dir);

[].concat(
	glob.sync(dir + '/core/modules/**/*.js'),
	glob.sync(dir + '/modules/**/*.js')
).forEach(function(moduleFile) {
	var data = getModuleMetadata(moduleFile);
	Object.keys(data.metrics).forEach(function(metricName) {
		metadata.count++;
		metadata.metrics[metricName] = data.metrics[metricName];
	});
});

// store metadata
var filename = __dirname + '/metadata.json',
	content = util.format('/**\n * This file was automatically generated at %s\n **/\nmodule.exports = %s;', (new Date()).toJSON(), JSON.stringify(metadata, null, '  '));

debug('Storing metadata in %s...', filename);
fs.writeFile(filename, content, function(err) {
	if (err) {
		debug('Storing failed: %s', err);
	}
	else {
		debug('Done');
	}
});
