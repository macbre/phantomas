/**
 * Expose puppeteer API and events emitter object for lib/index.js
 */
const debug = require('debug')('phantomas:browser'),
    puppeteer = require("puppeteer");

function browser() {
    this.events = require('events').EventEmitter;
}

browser.prototype.init = async () => {
    debug('Launching Puppeter');
    
    const args = []; // ['--no-sandbox'];
    const browser = await puppeteer.launch({args: args});

    // https://github.com/GoogleChrome/puppeteer/blob/v1.11.0/docs/api.md#browserversion
    debug('Browser: %s', await browser.version());

    await browser.close();
};

module.exports = browser;
