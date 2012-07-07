/**
 * Simple phantom.args parser
 */
exports.parse = function(args) {
	var res = {};
	args = args || [];

	args.forEach(function(item) {
		var idx = item.indexOf('='),
			key, val;

		// --foo
		if (idx < 0) {
			key = item.substring(2);
			val = true;
		}
		// --foo=bar
		else {
			key = item.substring(2, idx);
			val = item.substring(idx+1);
		}

		res[key] = val;
	});

	return res;
};
