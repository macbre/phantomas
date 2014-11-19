/**
 * Analyzes bits of data pertaining to the main request only
 */
'use strict';

exports.version = '0.1';

exports.module = function(phantomas) {
	var isMainRequest = true;
	var statusCodes = [];

	phantomas.on('recv', function(entry, res) {
		if (isMainRequest) {
			captureStatusCode(statusCodes, res.status);
		}
	});

	phantomas.on('responseEnd', function(entry, res) {
		isMainRequest = false;
		captureStatusCode(statusCodes, res.status);

		phantomas.setMetric('statusCodesTrail', statusCodes.join(','), true); // @desc comma-separated list of HTTP status codes that main request followed through (could contain a single element if the main request is a terminal one) [string]
	});

	function captureStatusCode(codes, code) {
		codes.push(code);
	}
};
