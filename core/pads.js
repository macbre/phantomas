/**
 * Helper functions for string formatting
 */
function lpad(str, len) {
	var fill;
	str = typeof str !== 'undefined' ? str : '-';

	fill = new Array( Math.max(1, len - str.toString().length + 1) ).join(' ');
	return fill + str;
}

function rpad(str, len) {
	var fill;
	str = typeof str !== 'undefined' ? str : '-';

	fill = new Array( Math.max(1, len - str.toString().length + 1) ).join(' ');
	return str + fill;
}

exports.lpad = lpad;
exports.rpad = rpad;

