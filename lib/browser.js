/**
 * Expose puppeteer API and events emitter object for lib/index.js
 */
const debug = require('debug')('phantomas:browser'),
    puppeteer = require("puppeteer");

function browser() {}

/**
 * Use the provided events emitter
 * @param {EventEmitter} events
 */
browser.prototype.bind = events => this.events = events;

// initialize puppeter instance
browser.prototype.init = async () => {
    debug('Launching Puppeter');

    const args = []; // ['--no-sandbox'];
    this.browser = await puppeteer.launch({args: args});
    this.page = await this.browser.newPage();

    this.events.emit('init', this.browser, this.page);

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
     */
    this.page.on('request', req => {
        debug('> [%s] %s %s', req.resourceType(), req.method(), req.url());

        this.events.emit('request', req);
    });

    /**
     * Emit an event when browser makes a request
     * 
     * @param {Puppeteer.Response} resp
     *
     *  https://github.com/GoogleChrome/puppeteer/blob/v1.11.0/docs/api.md#class-response
     */
    this.page.on('response', async resp => {
        var responseLength = 0;

        try {
            const buffer = await resp.buffer();
            responseLength = buffer.length;
        }
        catch {};

        debug('< HTTP %s %s (%f kB)', resp.status(), resp.url(), 1. * responseLength / 1024);

        this.events.emit('response', resp);
    });
};

/**
 * Opens the provided URL and emits all necessary events
 * 
 * @param {string} url
 */
browser.prototype.visit = async url => {
    debug('Go to URL: <%s>', url);
    await this.page.goto(url);
    debug('URL opened: <%s>', url);

    const metrics = await this.page.metrics();
    debug('Metrics: %s', JSON.stringify(metrics));

    this.events.emit('metrics', metrics);
}

// we're done
browser.prototype.close = async () => {
    await this.browser.close();
    this.events.emit('close');
};

module.exports = browser;
