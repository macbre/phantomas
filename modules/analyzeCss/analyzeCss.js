/**
 * Adds CSS related metrics using analyze-css NPM module
 *
 * @see https://github.com/macbre/analyze-css
 *
 * Run phantomas with --analyze-css option to use this module
 */
exports.version = '0.3';

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

	var cssMessages = [],
		isWindows = (require('system').os.name === 'windows'),
		binary = isWindows ? 'analyze-css.cmd' : 'analyze-css';

	phantomas.on('recv', function(entry, res) {
		if (entry.isCSS) {
			phantomas.log('CSS: analyzing <%s>...', entry.url);

			// run analyze-css "binary" installed by npm
			phantomas.runScript('node_modules/.bin/' + binary, ['--url', entry.url, '--json'], function(err, results) {
				if (err !== null) {
					phantomas.log('analyzeCss: sub-process failed!');
					return;
				}

				phantomas.log('analyzeCss: using ' + results.generator);

				var metrics = results.metrics || {},
					offenders = results.offenders || {};

				Object.keys(metrics).forEach(function(metric) {
					var metricPrefixed = 'css' + ucfirst(metric);

					// increase metrics
					phantomas.incrMetric(metricPrefixed, metrics[metric]);

					// and add offenders
					if (typeof offenders[metric] !== 'undefined') {
						offenders[metric].forEach(function(msg) {
							phantomas.addOffender(metricPrefixed, msg);
						});
					}
				});
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
