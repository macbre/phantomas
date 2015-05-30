/**
 * Analyzes images and detects which one can be lazy-loaded (are below the fold)
 *
 * @see https://github.com/macbre/phantomas/issues/494
 */
/* global document: true, window: true */
'use strict';

exports.version = '1.0';

exports.module = function(phantomas) {
	phantomas.setMetric('lazyLoadableImagesBelowTheFold'); // @desc number of images displayed below the fold that can be lazy-loaded

	phantomas.on('report', function() {
		phantomas.log('lazyLoadableImages: analyzing which images can be lazy-loaded...');

		phantomas.evaluate(function() {
			(function(phantomas) {
				phantomas.spyEnabled(false, 'analyzing which images can be lazy-loaded');

				var images = document.body.getElementsByTagName('img'),
					i,
					len = images.length,
					offset,
					processedImages = {},
					src,
					viewportHeight = window.innerHeight;

				phantomas.log('lazyLoadableImages: %d image(s) found, assuming %dpx offset to be the fold', len, viewportHeight);

				for (i = 0; i < len; i++) {
					// @see https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
					offset = images[i].getBoundingClientRect().top;
					src = images[i].src;

					// ignore base64-encoded images
					if (/^data:/.test(src)) {
						continue;
					}

					// get the most top position for a given image (deduplicate by src)
					if (typeof processedImages[src] === 'undefined') {
						processedImages[src] = offset;
					} else {
						processedImages[src] = Math.min(processedImages[src], offset);
					}
				}

				phantomas.log('lazyLoadableImages: checking %d unique image(s)', Object.keys(processedImages).length);

				Object.keys(processedImages).forEach(function(src) {
					var offset = processedImages[src];

					if (offset > viewportHeight) {
						phantomas.log('lazyLoadableImages: <%s> image is below the fold (at %dpx)', src, offset);

						phantomas.incrMetric('lazyLoadableImagesBelowTheFold');
						phantomas.addOffender('lazyLoadableImagesBelowTheFold', src);
					}
				});

				phantomas.spyEnabled(true);
			})(window.__phantomas);
		});
	});
};
