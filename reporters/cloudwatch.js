/**
 * Reporter for storing data in AWS CloudWatch
 * --reporter cloudwatch
 * --aws-access-key-id null
 * --aws-secret-key
 * --aws-region us-east-1
 * --aws-cloudwatch-api-version latest
 * --aws-cloudwatch-namespace phantomas
 *
 * Options:
 *  <AWSAccessKeyId>:<AWSSecretKey>:<AWSRegion>:<CloudWatchApiVersion>:<CloudWatchNameSpace>
 */
'use strict';

var AWS = require('aws-sdk'),
	Q = require('q');

var CLOUDWATCH_METRICS_DATA_CHUNK_SIZE = 20;

function _formatNumericalMetricsInChunksForCW(metricData) {
	var chunks = [];

	var formattedData = Object.keys(metricData)
		.filter(function(key) {
			return typeof metricData[key] == 'number';
		})
		.map(function(key) {
			return {
				MetricName: key,
				Value: metricData[key]
			};
		});

	while (formattedData.length > 0)
		chunks.push(formattedData.splice(0, CLOUDWATCH_METRICS_DATA_CHUNK_SIZE));

	return chunks;
}

function _pushChunkToCW(cloudwatch, namespace, cloudWatchMetricsData) {
	var deferred = Q.defer();

	var cloudWatchMetricSet = {
		Namespace: namespace,
		MetricData: cloudWatchMetricsData
	};

	cloudwatch.putMetricData(cloudWatchMetricSet, function(err, data) {
		if (err) deferred.reject(err);
		else deferred.resolve(data);
	});

	return deferred.promise;
}

module.exports = function(results, reporterOptions, options) {
	var debug = require('debug')('phantomas:reporter:cloudwatch'),
		params;

	// -R cloudwatch:<AWSAccessKeyId>:<AWSSecretKey>:<AWSRegion>:<CloudWatchApiVersion>:<CloudWatchNameSpace>
	if (reporterOptions.length > 0) {
		options['aws-access-key-id'] = reporterOptions[0];
		options['aws-secret-key'] = reporterOptions[1];
		options['aws-region'] = reporterOptions[2];
		options['aws-cloudwatch-api-version'] = reporterOptions[3];
		options['aws-cloudwatch-namespace'] = reporterOptions[4];
	}

	params = {
		AWSConfigs: {
			accessKeyId: options['aws-access-key-id'],
			secretAccessKey: options['aws-secret-key'],
			region: options['aws-region'] || 'us-east-1',
			apiVersion: options['aws-cloudwatch-api-version'] || 'latest'
		},
		CloudWatchNameSpace: options['aws-cloudwatch-namespace'] || 'phantomas-metrics'
	};

	debug('Patameters: %j', params);

	// public API
	return {
		render: function(done) {
			var cloudwatch = new AWS.CloudWatch(params.AWSConfigs),
				metrics = results.getMetrics();

			var cloudWatchMetricsDataChunks = _formatNumericalMetricsInChunksForCW(metrics);
			var promises = cloudWatchMetricsDataChunks.map(_pushChunkToCW.bind(this, cloudwatch, params.CloudWatchNameSpace));

			Q.all(promises)
				.then(function(_) {
					debug('All metrics sent');
				})
				.fail(function(err) {
					debug('Error: %s', err);
				})
				.finally(function() {
					done();
				});
		}
	};
};
