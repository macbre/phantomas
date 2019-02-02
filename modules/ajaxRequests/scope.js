(function(phantomas) {
    phantomas.spy(window.XMLHttpRequest.prototype, 'open', (result, method, url) => {
        phantomas.incrMetric('ajaxRequests');
        phantomas.addOffender('ajaxRequests', {url, method});

        phantomas.log('Ajax request: ' + url);
    }, true);
})(window.__phantomas);
