/**
 * Reports the use of functions known to be serious performance bottlenecks in JS
 *
 * @see http://www.nczonline.net/blog/2013/06/25/eval-isnt-evil-just-misunderstood/
 */
exports.version = '0.1';

exports.module = function(phantomas) {
        phantomas.setMetric('evalCalls');

	phantomas.once('init', function() {
		phantomas.evaluate(function() {
			(function(phantomas) {
					function reportEval(msg, caller, backtrace) {
						phantomas.log(msg +': from ' + caller + '!');
						phantomas.log('Backtrace: ' + backtrace);
						phantomas.incrMetric('evalCalls');
					}

					// spy calls to eval()
					phantomas.spy(window, 'eval', function(code) {
						reportEval('eval() called directly', phantomas.getCaller(), phantomas.getBacktrace());
						phantomas.log('eval\'ed code: ' + (code || '').substring(0, 150) + '(...)');
					});

					// spy calls to setTimeout / setInterval with string passed instead of a function
					phantomas.spy(window, 'setTimeout', function(fn, interval) {
						if (typeof fn !== 'string') return;

						reportEval('eval() called via setTimeout(' + fn + ')', phantomas.getCaller(), phantomas.getBacktrace());
					});

					phantomas.spy(window, 'setInterval', function(fn, interval) {
						if (typeof fn !== 'string') return;

						reportEval('eval() called via setInterval(' + fn + ')', phantomas.getCaller(), phantomas.getBacktrace());
					});
			})(window.__phantomas);
		});
	});
};
