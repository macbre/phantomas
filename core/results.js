/**
 * Simple results wrapper
 *
 * Will be passed via events and to formatters
 */
module.exports = function() {
	var metrics = {},
		notices = [],
		url;

	function addNotice(msg) {
		notices.push(msg);
	}

	function getNotices() {
		return notices;
	}

	function setMetric(name, value) {
		metrics[name] = value;
	}

	function getMetric(name) {
		return metrics[name];
	}

	function getMetrics() {
		return metrics;
	}

	function getMetricsNames() {
		return Object.keys(metrics);
	}

	function setUrl(_url) {
		url = _url;
	}

	function getUrl() {
		return url;
	}

	// public API
	this.addNotice = addNotice;
	this.getNotices = getNotices;

	this.setMetric = setMetric;
	this.getMetric = getMetric;
	this.getMetrics = getMetrics;
	this.getMetricsNames = getMetricsNames;

	this.setUrl = setUrl;
	this.getUrl = getUrl;
};
