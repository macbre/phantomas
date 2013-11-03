/**
 * Results formatter for --format=json
 */
module.exports = function(results) {
	function render() {
		var res = {
			url: results.getUrl(),
			metrics: results.getMetrics(),
			notices: results.getNotices()
		};

		return JSON.stringify(res);
	}

	// public API
	this.render = render;
};
