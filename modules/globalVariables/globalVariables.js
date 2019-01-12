/**
 * Counts global JavaScript variables
 */
/* global document: true, window: true */
'use strict';

module.exports = phantomas => {
	phantomas.setMetric('globalVariables'); // @desc number of JS globals variables @offenders
	phantomas.setMetric('globalVariablesFalsy'); // @desc number of JS globals variables with falsy value @offenders
};
