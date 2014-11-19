/**
 * Allow page to be scrolled after it is loaded
 *
 * Pass --scroll as an option in CLI mode
 */
/* global document: true, window: true */
'use strict';

exports.version = '0.1';

exports.module = function(phantomas) {
	var scroll = phantomas.getParam('scroll') === true;

	if (!scroll) {
		phantomas.log('Scroll: pass --scroll option to scroll down the page when it\'s loaded');
		return;
	}

	phantomas.log('Scroll: the page will be scrolled down when loaded');

	phantomas.reportQueuePush(function(done) {
		phantomas.on('loadFinished', function() {
			phantomas.evaluate(function() {
				(function(phantomas) {
					phantomas.log('Scroll: scrolling the page down...');
					document.body.scrollIntoView(false);

					var offset = document.body.scrollTop;
					phantomas.log('Scroll: scroll offset is %d px', offset);
				})(window.__phantomas);
			});

			// wait for lazy loading to do its job
			setTimeout(done, 250);
		});
	});
};
