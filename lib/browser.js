/**
 * Expose puppeteer API and events emitter object for lib/index.js
 */
const debug = require('debug')('phantomas:browser'),
    puppeteer = require("puppeteer");

function browser() {}

// use the provided events emitter
browser.prototype.bind = events => this.events = events;

// initialize puppeter instance
browser.prototype.init = async () => {
    debug('Launching Puppeter');

    const args = []; // ['--no-sandbox'];
    this.browser = await puppeteer.launch({args: args});
    this.page = await this.browser.newPage();

    this.events.emit('init', this.browser, this.page);

    // https://github.com/GoogleChrome/puppeteer/blob/v1.11.0/docs/api.md#browserversion
    debug('Browser: %s', await this.browser.version());
    debug('Viewport:', await this.page.viewport());

    // bind events
    this.page.on('console', msg => {
        debug('console.log:', msg.text());
        this.events.emit('consoleLog', msg);
    });

    // https://github.com/GoogleChrome/puppeteer/blob/v1.11.0/docs/api.md#event-request
    // https://github.com/GoogleChrome/puppeteer/blob/v1.11.0/docs/api.md#class-request
    this.page.on('request', req => {
        debug('> [%s] %s %s', req.resourceType(), req.method(), req.url());

        this.events.emit('request', req);
    });

    // https://github.com/GoogleChrome/puppeteer/blob/v1.11.0/docs/api.md#class-response
    this.page.on('response', async resp => {
        debug('< HTTP %s %s', resp.status(), resp.url());

        this.events.emit('response', resp);
    });
};

// visit the page and emit all necessary events
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
