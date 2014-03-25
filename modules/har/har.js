/**
* Log requests for build HAR output
* 
* @see: https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/HAR/Overview.html
*/

var VERSION = '0.1';
exports.version = VERSION;

var fs = require('fs');

/**
 * From netsniff.js with small workarounds
 * 
 * @see: https://github.com/ariya/phantomjs/blob/master/examples/netsniff.js
 */

if (!Date.prototype.toISOString) {
    Date.prototype.toISOString = function () {
        function pad(n) { return n < 10 ? '0' + n : n; }
        function ms(n) { return n < 10 ? '00'+ n : n < 100 ? '0' + n : n }
        return this.getFullYear() + '-' +
            pad(this.getMonth() + 1) + '-' +
            pad(this.getDate()) + 'T' +
            pad(this.getHours()) + ':' +
            pad(this.getMinutes()) + ':' +
            pad(this.getSeconds()) + '.' +
            ms(this.getMilliseconds()) + 'Z';
    }
}

function createHAR(address, title, startTime, endTime, resources)
{
    var entries = [];

    resources.forEach(function (resource) {
        var request = resource.request,
            startReply = resource.startReply,
            endReply = resource.endReply;

        if (!request || !startReply || !endReply) {
            return;
        }

        // Exclude Data URI from HAR file because
        // they aren't included in specification
        if (request.url.match(/(^data:image\/.*)/i)) {
            return;
    }

        entries.push({
            startedDateTime: request.time.toISOString(),
            time: endReply.time - request.time,
            request: {
                method: request.method,
                url: request.url,
                httpVersion: "HTTP/1.1",
                cookies: [],
                headers: request.headers,
                queryString: [],
                headersSize: -1,
                bodySize: -1
            },
            response: {
                status: endReply.status,
                statusText: endReply.statusText,
                httpVersion: "HTTP/1.1",
                cookies: [],
                headers: endReply.headers,
                redirectURL: "",
                headersSize: -1,
                bodySize: startReply.bodySize,
                content: {
                    size: startReply.bodySize,
                    mimeType: endReply.contentType == null ? "" : endReply.contentType
                }
            },
            cache: {},
            timings: {
                blocked: 0,
                dns: -1,
                connect: -1,
                send: 0,
                wait: startReply.time - request.time,
                receive: endReply.time - startReply.time,
                ssl: -1
            },
            pageref: address
        });
    });

    return {
        log: {
            version: '1.2',
            creator: {
                name: "Phantomas - HAR",
                version: VERSION
            },
            pages: [{
                startedDateTime: startTime.toISOString(),
                id: address,
                title: title,
                pageTimings: {
                    onLoad: endTime.getTime() - startTime.getTime()
                }
            }],
            entries: entries
        }
    };
}
/** End **/

exports.module = function(phantomas) {

    var param = phantomas.getParam('har'),
        path = '';

    if (typeof param === 'undefined') {
        phantomas.log('No HAR path specified, use --har <path>');
        return;
    }

    // --har
    if (param === true) {
        // defaults to "2013-12-07T20:15:01.521Z.har"
        path = (new Date()).toJSON() + '.har';
    }
    // --har [file name]
    else {
        path = param;
    }

    phantomas.log('HAR path: %s', path);

    var resources = [];
    var startTime;
    var endTime;
    var page;

    phantomas.on('pageBeforeOpen', function(p) {
        page = p;
    });

    phantomas.on('pageOpen', function() {
        startTime = new Date(); 
    });

    phantomas.on('loadFinished', function() {
        endTime = new Date();
    });

    phantomas.on('onResourceRequested', function(res, req) {
        resources[res.id] = {
            request: res,
            startReply: null,
            endReply: null
        };

    });

    phantomas.on('onResourceReceived', function(res) {
        if (res.stage === 'start')
            resources[res.id].startReply = res;

        if (res.stage === 'end')
            resources[res.id].endReply = res;
    });

    phantomas.on('report', function() {
        var address = page.url;
        var title = page.title;

        // Warning page was not finished correctly
        if (! endTime)
            endTime = new Date();

        phantomas.log('Create HAR');
        var har = createHAR(address, title, startTime, endTime, resources);

        phantomas.log('Convert HAR to JSON');
        var dump = JSON.stringify(har);

        phantomas.log('Write HAR in \'%s\'', path);
        fs.write(path, dump);

        phantomas.log('HAR Done !');
    });
};