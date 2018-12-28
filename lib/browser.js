/**
 * Expose puppeteer API and events emitter object for lib/index.js
 */
const debug = require('debug')('phantomas:browser'),
    puppeteer = require("puppeteer");

function Browser() {}

/**
 * Use the provided events emitter
 * @param {EventEmitter} events
 */
Browser.prototype.bind = events => this.events = events;

// initialize puppeter instance
Browser.prototype.init = async () => {
    const networkDebug = require('debug')('phantomas:network');

    debug('Launching Puppeter');

    const args = []; // ['--no-sandbox'];
    this.browser = await puppeteer.launch({args: args});
    this.page = await this.browser.newPage();

    // A Chrome Devtools Protocol session attached to the target
    this.cdp = this.page._client;

    this.events.emit('init', this.browser, this.page);

    debug('Using binary from: %s', this.browser.process().spawnfile);

    // https://github.com/GoogleChrome/puppeteer/blob/v1.11.0/docs/api.md#browserversion
    debug('Browser: %s', await this.browser.userAgent());
    debug('Viewport: %j', await this.page.viewport());

    // bind events
    this.page.on('console', msg => {
        debug('console.log:', msg.text());
        this.events.emit('consoleLog', msg);
    });

    /**
     * Emit an event when browser makes a request
     * 
     * @param {Puppeteer.Request} req
     *
     * @see https://github.com/GoogleChrome/puppeteer/blob/v1.11.0/docs/api.md#event-request
     * @see https://github.com/GoogleChrome/puppeteer/blob/v1.11.0/docs/api.md#class-request
     *
    this.page.on('request', req => {
        networkDebug('> [%s] %s %s', req.resourceType(), req.method(), req.url());

        console.log(req);
        this.events.emit('request', req);
    });
    **/

    /**
     * Emit an event when browser makes a request
     * 
     * @param {Puppeteer.Response} resp
     *
     *  https://github.com/GoogleChrome/puppeteer/blob/v1.11.0/docs/api.md#class-response
     *
    this.page.on('response', async resp => {
        var responseLength = 0;

        try {
            const buffer = await resp.buffer();
            responseLength = buffer.length;
        }
        catch {};

        networkDebug('response', resp);
        debug('< HTTP %s %s (%f kB)', resp.status(), resp.url(), 1. * responseLength / 1024);

        this.events.emit('response', resp);
    });
    **/

    /**
     * Bind to low-level network events
     * 
     * https://chromedevtools.github.io/devtools-protocol/tot/Network
     */

    // https://chromedevtools.github.io/devtools-protocol/tot/Network#event-requestWillBeSent
    this.cdp.on('Network.requestWillBeSent', data => {
        /** @type {Request} request */
        var request = data.request;
        request._requestId = data.requestId;
        request._timestamp = data.timestamp;
        request._type = data.type;
        request._initiator = data.initiator;

        networkDebug('> %s %s [%s]', request.method, request.url, request._initiator.type);

        this.events.emit('request', request);
    });

    // https://chromedevtools.github.io/devtools-protocol/tot/Network#event-responseReceived
    this.cdp.on('Network.responseReceived', data => {
        /** @type {Response} response */
        var response = data.response;
        response._requestId = data.requestId;
        response._timestamp = data.timestamp;

        //networkDebug('responseReceived', response);
        networkDebug('< %s %s %s %s', response.protocol, response.status, response.statusText, response.url);

        this.events.emit('response', response);
    });
};

/**
 * Opens the provided URL and emits all necessary events
 * 
 * @param {string} url
 */
Browser.prototype.visit = async url => {
    debug('Go to URL: <%s>', url);
    await this.page.goto(url);
    debug('URL opened: <%s>', url);

    const metrics = await this.page.metrics();
    debug('Metrics: %s', JSON.stringify(metrics));

    this.events.emit('metrics', metrics);
}

// we're done
Browser.prototype.close = async () => {
    await this.browser.close();
    this.events.emit('close');
};

module.exports = Browser;
