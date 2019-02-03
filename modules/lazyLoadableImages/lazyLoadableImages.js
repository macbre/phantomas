/**
 * Analyzes images and detects which one can be lazy-loaded (are below the fold)
 */
/* global document: true, window: true */
'use strict';

module.exports = phantomas => {
	phantomas.setMetric('lazyLoadableImagesBelowTheFold'); // @desc number of images displayed below the fold that can be lazy-loaded @offenders
};
