/**
 * Simple phantom.args parser
 */
exports.parse = function(args) {
	var res = {},
		lastKey = false;

	args = args || [];

	args.slice(1).forEach(function(item) {
		var hasDash = item.indexOf('--') === 0,
			equalIdx = item.indexOf('='),
			key, val;

		// -foo test
		// assign value to a proper key
		if (!hasDash && lastKey !== false) {
			key = lastKey;
			val = item;
		}
		// --foo
		else if (equalIdx < 0) {
			key = item.substring(2);
			val = true;
		}
		// --foo=bar
		else {
			key = item.substring(2, equalIdx);
			val = item.substring(equalIdx+1);
		}

		lastKey = key;

		res[key] = val;
	});

	return res;
};
