/**
 * Analyzes bits of data pertaining to the main request only
 */
exports.version = '0.1';

exports.module = function (phantomas) {
    var isMainRequest = true;

    phantomas.setMetric('statusCodesTrail', []); // @desc list of HTTP status codes that main request followed through

    phantomas.on('recv', function (entry, res) {
        if (isMainRequest) {
            captureStatusCode(res.status);
        }
    });

    phantomas.on('responseEnd', function (entry, res) {
        isMainRequest = false;
        captureStatusCode(res.status);
    });

    function captureStatusCode(code) {
        phantomas.getMetric('statusCodesTrail').push(code);
    }
};
