/**
 * Results formatter
 */
module.exports = function(results, format) {
	var formatterPath = './formatters/' + format,
		formatter;

	try {
		formatter = new (require(formatterPath))(results);
	}
	catch(ex) {
		throw 'formatter: format "' + format + '" is not supported!';
	}

	function render() {
		return formatter.render();
	}

	// public interface
	this.render = render;
};
