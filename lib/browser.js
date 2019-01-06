/**
 * Expose puppeteer API and events emitter object for lib/index.js
 */
const debug = require('debug')('phantomas:browser'),
    puppeteer = require("puppeteer");

function Browser() {
    this.browser = null;
    this.page = null;
}

/**
 * Use the provided events emitter
 * @param {EventEmitter} events
 */
Browser.prototype.bind = events => this.events = events;

// initialize puppeter instance
Browser.prototype.init = async () => {
    const networkDebug = require('debug')('phantomas:network'),
        env = require('process').env;

    var options = {
        args: [
            // page.evaluate throw "Protocol error (Runtime.callFunctionOn): Target closed." without the following
            // https://github.com/GoogleChrome/puppeteer/issues/1175#issuecomment-369728215
            '--disable-dev-shm-usage'
        ]
    };

    // customize path to Chromium binary
    if (env['PHANTOMAS_CHROMIUM_EXECUTABLE']) {
        options.executablePath = env['PHANTOMAS_CHROMIUM_EXECUTABLE'];
    }

    debug('Launching Puppeter: %j', options);

    this.browser = await puppeteer.launch(options);
    this.page = await this.browser.newPage();

    // A Chrome Devtools Protocol session attached to the target
    this.cdp = this.page._client;

    debug('Using binary from: %s', this.browser.process().spawnfile);

    // https://github.com/GoogleChrome/puppeteer/blob/v1.11.0/docs/api.md#browserversion
    debug('Browser: %s', await this.browser.userAgent());
    debug('Viewport: %j', await this.page.viewport());

    // bind events
    this.page.on('console', msg => {
        debug('console.log:', msg.text());
        this.events.emit('consoleLog', msg);
    });

    // storage for requests metadata
    var responses = {};

    /**
     * Bind to low-level network events
     * 
     * https://chromedevtools.github.io/devtools-protocol/tot/Network
     */

    // https://chromedevtools.github.io/devtools-protocol/tot/Network#event-requestWillBeSent
    // Fired when page is about to send HTTP request
    this.cdp.on('Network.requestWillBeSent', data => {
        /** @type {Request} request */
        var request = data.request;
        request._requestId = data.requestId;
        request._timestamp = data.timestamp;
        request._type = data.type;
        request._initiator = data.initiator;

        networkDebug('Network.requestWillBeSent > %s %s [%s]', request.method, request.url, request._initiator.type);

        this.events.emit('request', request);

        responses[data.requestId] = {
            _chunks: 0,
            _dataLength: 0,
            // Actual bytes received (might be less than dataLength for compressed encodings).
            _encodedDataLength: 0,
        };
    });

    // https://chromedevtools.github.io/devtools-protocol/tot/Network#event-responseReceived
    // Fired when HTTP response is available (HTTP headers are present)
    this.cdp.on('Network.responseReceived', data => {
        /** @type {Response} response */
        var response = data.response;
        response._requestId = data.requestId;

        //networkDebug('responseReceived', response);
        //networkDebug('Network.responseReceived < %s %s %s %s', response.protocol, response.status, response.statusText, response.url);

        // next event tells us that the response was fully fetched
        responses[data.requestId].response = response;
    });

    // https://chromedevtools.github.io/devtools-protocol/tot/Network#event-loadingFinished
    // Fired when HTTP request has finished loading
    this.cdp.on('Network.loadingFinished', data => {
        var meta = responses[data.requestId],
            response = meta.response;

        response.dataLength = meta._dataLength;
        response.encodedDataLength = meta._encodedDataLength;
        response.chunks = meta._chunks;
        response._timestamp = data.timestamp;

        //networkDebug('Network.loadingFinished', data);
        networkDebug('Network.loadingFinished < %s %s %s %s (%f kB fetched, %f kB uncompressed)',
            response.protocol, response.status, response.statusText, response.url,
            1.0 * response.encodedDataLength / 1024,
            1.0 * response.dataLength / 1024);

        this.events.emit('response', response);
    });

    // https://chromedevtools.github.io/devtools-protocol/tot/Network#event-dataReceived
    // Fired when data chunk was received over the network
    this.cdp.on('Network.dataReceived', data => {
        // networkDebug('Network.dataReceived', data);

        responses[data.requestId]._chunks++;
        responses[data.requestId]._dataLength += data.dataLength;
        // Actual bytes received (might be less than dataLength for compressed encodings)
        responses[data.requestId]._encodedDataLength += data.encodedDataLength;
    });

    return this.page;
};

/**
 * Opens the provided URL and emits all necessary events
 * 
 * @param {string} url
 */
Browser.prototype.visit = url => {
    return new Promise(async (resolve, reject) => {
        debug('Go to URL: <%s>', url);
        try {
            await this.page.goto(url);
        }
        catch(ex) {
            debug('Opening URL failed: ' + ex);
            return reject(ex);
        }
        debug('URL opened: <%s>', url);

        // https://github.com/GoogleChrome/puppeteer/issues/1325#issuecomment-382003386
        // bind to this event when getting "Protocol error (Runtime.callFunctionOn): Target closed."
        // while calling page.evaluate()
        this.events.emit('loaded', this.page);

        const metrics = await this.page.metrics();
        debug('Metrics: %s', JSON.stringify(metrics));

        this.events.emit('metrics', metrics);
        resolve();
    });
}

// we're done
Browser.prototype.close = async () => {
    await this.browser.close();
    this.events.emit('close');
    debug('Browser closed');
};

module.exports = Browser;
