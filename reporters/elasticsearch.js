/**
 * Reporter for storing data in ElasticSearch
 *
 * --reporter elasticsearch
 * --elasticsearch-host localhost
 * --elasticsearch-port 9200
 * --elasticsearch-index "myapp"
 * --elasticsearch-type "phantomas-report"
 *
 * Options:
 *  <host>:<port>:<index>:<type>
 */
'use strict';

module.exports = function(results, reporterOptions, options) {
	var debug = require('debug')('phantomas:reporter:elasticsearch'),
		params;

	// -R elasticsearch:<host>:<port>:<index>:<type>
	if (reporterOptions.length > 0) {
		options['elasticsearch-host'] = reporterOptions[0];
		options['elasticsearch-port'] = reporterOptions[1];
		options['elasticsearch-index'] = reporterOptions[2];
		options['elasticsearch-type'] = reporterOptions[3];
	}

	params = {
		host: (options['elasticsearch-host'] || 'localhost') + ':' + (options['elasticsearch-port'] || 9200),
		type: (options['elasticsearch-type'] || 'phantomas-report'),
		index: (options['elasticsearch-index'] || 'phantomas_results')
	};

	debug('Parameters: %j', params);

	// public API
	return {
		render: function(done) {
			var elasticsearch = require('elasticsearch'),
				client = new elasticsearch.Client({
					host: params.host
				}),
				metrics = results.getMetricsNames(),
				documentBody = {
					url: results.getUrl(),
					reportDate: new Date()
				},
				mappingFields = {
					url: {
						type: 'string',
						index: 'not_analyzed'
					},
					reportDate: {
						type: 'date'
					}
				};
			// create and index an elasticsearch document with metrics data
			function indexReport(documentBody) {
				client.create({
					index: params.index,
					type: params.type,
					id: '',
					body: documentBody
				}, function(error) {
					if (typeof error != "undefined") {
						debug('Indexing error : %s ', error);
					}
					done();
				});
			}

			// store metrics value and mapping types
			metrics.forEach(function(metric) {
				var value = results.getMetric(metric);
				documentBody[metric] = value;

				mappingFields[metric] = {
					type: (isNaN(value) ? 'string' : 'integer')
				};
			});

			client.indices.exists({
				index: params.index
			}, function(err, exists) {
				if (typeof(err) == "undefined") {
					// index does not exists, we have to create it and define the mapping
					if (!exists) {
						client.indices.create({
							index: params.index
						}, function(err) {
							if (typeof(err) == "undefined") {
								var mapping = {};
								mapping[params.type] = {
									properties: mappingFields
								};
								client.indices.putMapping({
									type: params.type,
									index: params.index,
									body: mapping
								}, function(err) {
									if (typeof(err) == "undefined") {
										indexReport(documentBody);
									} else {
										debug('create mapping error : %s ', err);
										done();
									}
								});
							} else {
								debug('create index error : %s ', err);
								done();
							}
						});
					} else {
						indexReport(documentBody);
					}
				} else {
					debug('index exists error : %s ', err);
					done();
				}
			});
		}
	};
};
