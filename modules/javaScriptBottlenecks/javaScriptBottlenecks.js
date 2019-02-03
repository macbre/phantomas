/**
 * Reports the use of functions known to be serious performance bottlenecks in JS
 * 
 * Run phantomas with --spy-eval to count eval() calls (see issue #467)
 */
'use strict';

/**
 * @see http://www.nczonline.net/blog/2013/06/25/eval-isnt-evil-just-misunderstood/
 * @see http://www.quirksmode.org/blog/archives/2005/06/three_javascrip_1.html
 * @see http://www.stevesouders.com/blog/2012/04/10/dont-docwrite-scripts/
 */
module.exports = function(phantomas) {
	phantomas.setMetric('documentWriteCalls'); //@desc number of calls to either document.write or document.writeln @offenders
	phantomas.setMetric('evalCalls'); // @desc number of calls to eval (either direct or via setTimeout / setInterval) @offenders
};
