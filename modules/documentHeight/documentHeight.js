/**
 * Measure document height
 */
/* global document: true */
'use strict';

exports.version = '0.1';

exports.module = function(phantomas) {
	phantomas.setMetric('documentHeight'); // @desc the page height [px]

	phantomas.on('report', function() {
		phantomas.setMetricEvaluate('documentHeight', function() {
			// @see https://github.com/HTTPArchive/httparchive/blob/master/custom_metrics/document_height.js
			var doc = document,
				body = doc.body,
				docelem = doc.documentElement;

			return Math.max(body.scrollHeight, body.offsetHeight, docelem.clientHeight, docelem.scrollHeight, docelem.offsetHeight);
		});
	});
};
