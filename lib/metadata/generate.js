#!/usr/bin/env node

/*jshint -W083: false */

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
		metricsCount: 0,
		modulesCount: 0,
		version: phantomas.version
	};

function getModuleMetadata(moduleFile) {
	var content = fs.readFileSync(moduleFile).toString(),
		data = {
			metrics: {}
		},
		matches,
		moduleName,
		re = /(setMetric|setMetricEvaluate|incrMetric)\(['"]([^'"]+)['"](\)|,)(.*@desc.*$)?/mg;

	moduleName = moduleFile.split('/').pop().replace(/\.js$/, '');

	// scan the source code
	while ((matches = re.exec(content)) !== null) {
		var entry = {},
			metricName = matches[2],
			metricComment = matches[4],
			metricUnit = 'ms',
			hasDesc = (metricComment && metricComment.indexOf('@desc') > -1);

		if (typeof data.metrics[metricName] !== 'undefined') {
			if (hasDesc) {
				debug('Found duplicated definition of %s metric in %s module', metricName, moduleName);
			}
			continue;
		}

		// parse @desc
		if (hasDesc) {
			metricComment = metricComment.split('@desc').pop().trim();
			entry.desc = '';

			['unreliable', 'optional', 'offenders', 'gecko'].forEach(function(marker) {
				if (metricComment.indexOf('@' + marker) > -1) {
					entry[marker] = true;
					metricComment = metricComment.replace('@' + marker, '').trim();
				}
			});

			// detect units (defaults to ms)
			if ((matches = metricComment.match(/\[([^\]]+)\]/)) !== null) {
				metricUnit = matches[1];
				metricComment = metricComment.replace(matches[0], '').trim();
			} else if (/^(number of|total number of|average specificity|total specificity|median of number|maximum number|maximum level)/.test(metricComment)) {
				metricUnit = 'number';
			} else if (/^(the size|size|length|total length) of/.test(metricComment)) {
				metricUnit = 'bytes';
			}

			// check if offenders are reported for this metric
			if (content.indexOf('phantomas.addOffender(\'' + metricName + "'") > -1) {
				entry.offenders = true;
			}

			entry.desc = metricComment;
			entry.unit = metricUnit;
		} else {
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
		metadata.metricsCount++;
		metadata.metrics[metricName] = data.metrics[metricName];
	});

	metadata.modulesCount++;
});

// store metadata
var filename = __dirname + '/metadata.json',
	content = JSON.stringify(metadata, null, '  ');

debug('Storing metadata in %s...', filename);
fs.writeFile(filename, content, function(err) {
	if (err) {
		debug('Storing failed: %s', err);
	} else {
		debug('Done');
	}
});
