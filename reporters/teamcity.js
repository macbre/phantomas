/**
 * Results formatter for -R teamcity
 *
 * Options:
 *  prefix-url - prefix the url to the metric key
 *  postfix-url - postfix the url to the metric key
 *  prefix - explicit prefix to the metric key
 *  postfix - explicit postfix to the metric key
 */
'use strict';

module.exports = function(results, reporterOptions) {

	var isMultiple = Array.isArray(results);

	function createTeamCityMessage(metric, value) {
		var key = metric;
		if (reporterOptions.prefix)
			key = reporterOptions.prefix + '.' + key;
		if (reporterOptions.postfix)
			key = key + '.' + reporterOptions.postfix;
		if (reporterOptions['prefix-url'] === true)
			key = results.getUrl() + '.' + key;
		if (reporterOptions['postfix-url'] === true)
			key = key + '.' + results.getUrl();

		key = key.replace(/'/g, '&apos;');

		return "##teamcity[buildStatisticValue key='" + key + "' value='" + value + "']";
	}

	function renderSingleResult() {
		var metrics = results.getMetricsNames(),
			messages = [];

		metrics.forEach(function(metric) {
			var value = results.getMetric(metric);
			messages.push(createTeamCityMessage(metric, value));
		});

		return messages.join('\n') + '\n';
	}

	function renderAvgResults() {
		var transposed = {},
			messages = [];

		results.forEach(function(run) {
			var metrics = run.getMetricsNames();
			metrics.forEach(function(metric) {
				if (!transposed[metric])
					transposed[metric] = [];
				transposed[metric].push(run.getMetric(metric));
			});
		});

		for (var metric in transposed) {
			var value = transposed[metric].reduce(function(a, b) {
				return a + b;
			}, 0);
			value = value / transposed[metric].length;
			messages.push(createTeamCityMessage(metric, value));
		}

		return messages.join('\n') + '\n';
	}

	return {
		handlesMultiple: true,
		render: function() {
			if (isMultiple)
				return renderAvgResults();
			else
				return renderSingleResult();
		}
	};
};
