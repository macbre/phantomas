/**
 * Analyzes AJAX requests
 */
"use strict";

module.exports = function (phantomas) {
  phantomas.setMetric("ajaxRequests"); // @desc number of AJAX requests @offenders
  phantomas.setMetric("synchronousXHR"); // @desc number of synchronous XMLHttpRequest @offenders
};
