(async phantomas => {

	// spy calls to eval only when requested (issue #467)
	var spyEval = await phantomas.getParam('spy-eval') === true;

    console.log(await phantomas.getParam('url'))
    console.log(await phantomas.getParam('spy-eval'))
    console.log(spyEval);

	if (!spyEval) {
		phantomas.log('javaScriptBottlenecks: to spy calls to eval() run phantomas with "spy-eval" option set to true');
    }
    else {
        phantomas.log('javaScriptBottlenecks: eval() calls will be checked');
    }

    function report(msg, caller, backtrace, metric) {
        phantomas.log(msg + ': from ' + caller + '!');
        phantomas.log('Backtrace: ' + backtrace);

        phantomas.incrMetric(metric);
        phantomas.addOffender(metric, {message: msg, caller});
    }

    // spy calls to eval()
    if (spyEval) {
        phantomas.spy(window, 'eval', function(code) {
            report('eval() called directly', phantomas.getCaller(), phantomas.getBacktrace(), 'evalCalls');
            phantomas.log('eval\'ed code: ' + (code || '').substring(0, 150) + '(...)');
        });
    }

    // spy calls to setTimeout / setInterval with string passed instead of a function
    phantomas.spy(window, 'setTimeout', function(fn, _) {
        if (typeof fn !== 'string') return;

        report('eval() called via setTimeout("' + fn + '")', phantomas.getCaller(), phantomas.getBacktrace(), 'evalCalls');
    });

    phantomas.spy(window, 'setInterval', function(fn, _) {
        if (typeof fn !== 'string') return;

        report('eval() called via setInterval("' + fn + '")', phantomas.getCaller(), phantomas.getBacktrace(), 'evalCalls');
    });

    // spy document.write(ln)
    phantomas.spy(document, 'write', function(_) {
        report('document.write() used', phantomas.getCaller(), phantomas.getBacktrace(), 'documentWriteCalls');
    });

    phantomas.spy(document, 'writeln', function(_) {
        report('document.writeln() used', phantomas.getCaller(), phantomas.getBacktrace(), 'documentWriteCalls');
    });
})(window.__phantomas);
