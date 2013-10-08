/**
 * Reports the use of functions known to be serious performance bottlenecks in JS
 *
 * @see http://www.nczonline.net/blog/2013/06/25/eval-isnt-evil-just-misunderstood/
 * @see http://www.quirksmode.org/blog/archives/2005/06/three_javascrip_1.html
 * @see http://www.stevesouders.com/blog/2012/04/10/dont-docwrite-scripts/
 */
exports.version = '0.1';

exports.module = function(phantomas) {
        phantomas.setMetric('documentWriteCalls');
        phantomas.setMetric('evalCalls');

	phantomas.once('init', function() {
		phantomas.evaluate(function() {
			(function(phantomas) {
					function report(msg, caller, backtrace, metric) {
						phantomas.log(msg +': from ' + caller + '!');
						phantomas.log('Backtrace: ' + backtrace);
						phantomas.incrMetric(metric);
					}

					// spy calls to eval()
					phantomas.spy(window, 'eval', function(code) {
						report('eval() called directly', phantomas.getCaller(), phantomas.getBacktrace(), 'evalCalls');
						phantomas.log('eval\'ed code: ' + (code || '').substring(0, 150) + '(...)');
					});

					// spy calls to setTimeout / setInterval with string passed instead of a function
					phantomas.spy(window, 'setTimeout', function(fn, interval) {
						if (typeof fn !== 'string') return;

						report('eval() called via setTimeout("' + fn + '")', phantomas.getCaller(), phantomas.getBacktrace(), 'evalCalls');
					});

					phantomas.spy(window, 'setInterval', function(fn, interval) {
						if (typeof fn !== 'string') return;

						report('eval() called via setInterval("' + fn + '")', phantomas.getCaller(), phantomas.getBacktrace(), 'evalCalls');
					});

					// spy document.write(ln)
					phantomas.spy(document, 'write', function(arg) {
						report('document.write() used', phantomas.getCaller(), phantomas.getBacktrace(), 'documentWriteCalls');
					});

					phantomas.spy(document, 'writeln', function(arg) {
						report('document.writeln() used', phantomas.getCaller(), phantomas.getBacktrace(), 'documentWriteCalls');
					});
			})(window.__phantomas);
		});
	});
};
