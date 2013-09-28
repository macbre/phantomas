/**
 * Runs analyze-css helper script and add CSS related metrics
 */
exports.version = '0.1';

exports.module = function(phantomas) {
	if (!phantomas.getParam('analyze-css')) {
		phantomas.log('To enable CSS in-depth metrics please run phantomas with --analyze-css option');
		return;
	}

	function ucfirst(str) {
		// http://kevin.vanzonneveld.net
		// +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
		// +   bugfixed by: Onno Marsman
		// +   improved by: Brett Zamir (http://brett-zamir.me)
		// *     example 1: ucfirst('kevin van zonneveld');
		// *     returns 1: 'Kevin van zonneveld'
		str += '';
		var f = str.charAt(0).toUpperCase();
		return f + str.substr(1);
	}

	phantomas.on('recv', function(entry, res) {
		if (entry.isCSS) {
			phantomas.log('CSS: analyzing <%s>...', entry.url);

			phantomas.runScript('analyze-css.js', ['--url', entry.url, '--json'], function(err, results) {
				if (err !== null) {
					phantomas.log('CSS: failed!');
					return;
				}

				//phantomas.log('CSS: results - %s', JSON.stringify(results));

				Object.keys(results).forEach(function(metric) {
					phantomas.incrMetric('css' + ucfirst(metric), results[metric]);
				});
			});
		}
	});
};
