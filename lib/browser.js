/**
 * Expose puppeteer API and events emitter object for lib/index.js
 */
const debug = require('debug')('phantomas:browser'),
    puppeteer = require("puppeteer"),
    VERSION = require('../package.json').version;

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

    // https://github.com/GoogleChrome/puppeteer/blob/v1.11.0/docs/api.md#puppeteerlaunchoptions
    this.browser = await puppeteer.launch(options);
    this.page = await this.browser.newPage();

    // A Chrome Devtools Protocol session attached to the target
    this.cdp = this.page._client;

    debug('Using binary from: %s', this.browser.process().spawnfile);

    // set a custom user agent, e.g. "phantomas/2.0.0-beta (HeadlessChrome/72.0.3617.0)"
    // https://github.com/GoogleChrome/puppeteer/blob/v1.11.0/docs/api.md#pagesetuseragentuseragent
    const browserVersion = await this.browser.version();
    await this.page.setUserAgent('phantomas/' + VERSION + ' (' + browserVersion + ')');

    // https://github.com/GoogleChrome/puppeteer/blob/v1.11.0/docs/api.md#browserversion
    debug('Original browser: %s', await this.browser.userAgent());
    debug('Viewport: %j', await this.page.viewport());

    // bind events
    this.page.on('console', msg => {
        debug('console.log:', msg.text());
        this.events.emit('consoleLog', msg);
    });

    // https://github.com/GoogleChrome/puppeteer/blob/v1.11.0/docs/api.md#event-dialog
    // Emitted when a JavaScript dialog appears, such as alert, prompt, confirm or beforeunload
    this.page.on('dialog', async dialog => {
        // https://github.com/GoogleChrome/puppeteer/blob/v1.11.0/docs/api.md#class-dialog
        const message = dialog.message();
        debug('dialog: %s [%s]', dialog._type, message);

        switch(dialog._type) {
            case 'alert':
            case 'confirm':
            case 'prompt':
                this.events.emit(dialog._type, message);
                break;
        }

        await dialog.dismiss();
    });

    // @see https://github.com/GoogleChrome/puppeteer/blob/v1.11.0/docs/api.md#event-pageerror
    this.page.on('pageerror', x => {
        const lines = x.message.split('\n');

        debug('Page error: ' + x);
        this.events.emit('jserror', lines[0].trim(), lines.slice(1));
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

    this.onRequestLoaded = (eventName, data) => {
        var meta = responses[data.requestId],
            response = meta.response;

        // errorText: 'net::ERR_FAILED' - request is blocked (meta.response will be empty)
        // errorText: 'net::ERR_ABORTED' - HTTP 404
        if (typeof data.errorText === 'string') {
            networkDebug('Request failed with "%s"', data.errorText);

            if (typeof meta.response === 'undefined') {
                return;
            }
        }

        response.dataLength = meta._dataLength;
        response.encodedDataLength = meta._encodedDataLength;
        response.chunks = meta._chunks;
        response._timestamp = data.timestamp;

        // https://chromedevtools.github.io/devtools-protocol/tot/Network#method-getResponseBody
        // https://github.com/GoogleChrome/puppeteer/blob/v1.11.0/docs/api.md#cdpsessionsendmethod-params
        response.getContent = (async () => {
            networkDebug('Getting content for #%s', data.requestId);
            const resp = await this.cdp.send('Network.getResponseBody', {requestId: data.requestId});
            networkDebug('Content for #%s received (%d bytes)', data.requestId, resp.body.length);

            //console.log('getContent()', resp);
            return resp.body;
        }).bind(this);

        //networkDebug('Network.loadingFinished', data);
        networkDebug('Network.%s < %s %s %s %s (%f kB fetched, %f kB uncompressed)',
            eventName,
            response.protocol, response.status, response.statusText, response.url,
            1.0 * (response.encodedDataLength || response.headers['content-length'] || 0) / 1024,
            1.0 * response.dataLength / 1024);

        this.events.emit('response', response);
    };

    // https://chromedevtools.github.io/devtools-protocol/tot/Network#event-loadingFinished
    // Fired when HTTP request has finished loading
    this.cdp.on('Network.loadingFinished', data => this.onRequestLoaded('loadingFinished', data));

    // https://chromedevtools.github.io/devtools-protocol/tot/Network#event-loadingFailed
    // Fired when HTTP request has failed to load (e.g. HTTP 404)
    this.cdp.on('Network.loadingFailed', data => this.onRequestLoaded('loadingFailed', data));

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
 * @param {string?} waitUntil
 * @param {number} timeout
 */
Browser.prototype.visit = (url, waitUntil, timeout) => {
    return new Promise(async (resolve, reject) => {
        waitUntil = waitUntil || 'load';

        debug('Go to URL <%s> and wait for "%s"', url, waitUntil);
        try {
            // https://github.com/GoogleChrome/puppeteer/blob/v1.11.0/docs/api.md#pagegotourl-options
            await this.page.goto(url, {
                waitUntil: waitUntil,
                timeout: (timeout || 30) * 1000 // defaults to 30 seconds, provide in miliseconds!
            });
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
