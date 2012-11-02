#!/usr/local/bin/node
/**
 * This is a helper script allowing you to run phantomas multiple times and
 * get a nice looking table with all the metrics + avg / median / min / max values
 */
var exec = require('child_process').exec,
	args = process.argv.slice(2),
	params = require('./lib/args').parse(args);

// handle --runs CLI parameter
var runs = parseInt(params.runs) || 3,
	metrics = [];

function runPhantomas(callback) {
	var cmd = '/home/macbre/bin/phantomjs phantomas.js --format=json --url=' + params.url;

	// @see http://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback
 	exec(cmd, function(error, stdout, stderr) {
		var res = JSON.parse(stdout) || false;

		if (res === false) {
			console.log(stdout);
		}
		else if (typeof callback === 'function') {
			callback(res);
		}
	});
}

function run() {
	if (runs--) {
		console.log('Remaining runs: ' + (runs + 1));

		runPhantomas(function(res) {
			if (res) {
				metrics.push(res.metrics);
				run();
			}
		});
	}
	else {
		console.log('Done');
		formatResults(metrics);
	}
};

function formatResults(metrics) {
	var entries = {},
		entry,
		metric;

	// prepare entries
	for(metric in metrics[0]) {
		entries[metric] = {
			values: [],
			sum: 0,
			min: 0,
			max: 0,
			median: 0,
			average: 0
		};
	}

	// process all runs
	metrics.forEach(function(data) {
		var metric;
		for (metric in data) {
			entries[metric].values.push(data[metric]);
		}
	});

	// calculate stats
	for (metric in entries) {
		entry = entries[metric];

		entry.values = entry.values.sort(function (a, b) {return a - b});
		entry.min = entry.values.slice(0, 1).pop();
		entry.max = entry.values.slice(-1).pop();

		for (var i=0, len = entry.values.length++; i<len; i++) {
			entry.sum += entry.values[i];
		}

		entry.average = len && (entry.sum / len);
		entry.median = (len % 2 === 0) ? ((entry.values[len >> 1] + entry.values[len >> 1 + 1])/2) : entry.values[len >> 1];
	}

	console.log(entries);
}

console.log('Performing ' + runs + ' phantomas runs for <' + params.url + '>...');

run();

