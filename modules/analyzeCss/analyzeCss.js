/**
 * Runs analyze-css helper script and adds CSS related metrics
 *
 * Run phantomas with --analyze-css option to use this module
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

	var cssMessages = [];

	phantomas.on('recv', function(entry, res) {
		if (entry.isCSS) {
			phantomas.log('CSS: analyzing <%s>...', entry.url);

			phantomas.runScript('analyze-css.js', ['--url', entry.url, '--json'], function(err, results) {
				if (err !== null) {
					phantomas.log('CSS: parsing failed!');
					return;
				}

				var metrics = results.metrics || {},
					messages = results.messages || [];

				// increase metrics
				Object.keys(metrics).forEach(function(metric) {
					phantomas.incrMetric('css' + ucfirst(metric), metrics[metric]);
				});

				// register CSS notices
				cssMessages = cssMessages.concat(messages);
			});
		}
	});

	phantomas.on('report', function() {
		// limit number of messages
		var limit = 50,
			len = cssMessages.length;

		phantomas.setMetric('cssNotices', len);

		if (len > 0) {
			cssMessages = cssMessages.slice(0, limit);

			phantomas.addNotice('CSS notices (%s):', len);
			cssMessages.forEach(function(msg) {
				phantomas.addNotice(' ' + msg);
			});

			if (len > limit) {
				phantomas.addNotice(' (%d more...)', len - limit);
			}

			phantomas.addNotice();
		}
	});
};
