phantomas
=========

![GitHub Logo](http://upload.wikimedia.org/wikipedia/en/a/a5/Fantomas.jpg)

PhantomJS-based modular web performance metrics collector.

And why phantomas? Well, [because](http://en.wikipedia.org/wiki/Fantômas) :)

## Requirements

* [PhantomJS 1.7+](http://phantomjs.org/)
* [NodeJS](http://nodejs.org) (for `run-multiple.js` script)

## Installation

```
npm install phantomas
```

## Dependencies

phantomas uses the following 3rd party libraries (located in `/lib` directory):

* CommonJS modules from [phantomjs-nodify](https://github.com/jgonera/phantomjs-nodify) and nodejs source

## Let's make Web a bit faster!

* [Best Practices for Speeding Up Your Web Site](http://developer.yahoo.com/performance/rules.html) (by Yahoo!)
* [Web Performance Best Practices](https://developers.google.com/speed/docs/best-practices/rules_intro) (by Google)
* [Writing Efficient CSS](http://developer.mozilla.org/en/Writing_Efficient_CSS) (by Mozilla)

## Contributors

* [macbre](https://github.com/macbre)
* [jmervine](https://github.com/jmervine)
* [jmosney](https://github.com/jmosney)
* [umaar](https://github.com/umaar)
* All the [contributors](https://github.com/macbre/phantomas/graphs/contributors)

## Usage

### Single run

``` bash
./phantomas.js --url=https://github.com/macbre/phantomas  --verbose
```

#### Parameters

* `--url` URL of the page to generate metrics for (required)
* `--format=[json|csv|plain]` output format (``plain`` is the default one)
* `--timeout=[seconds]` timeout for phantomas run (defaults to 15 seconds)
* `--viewport=[width]x[height]` phantomJS viewport dimensions (1280x1024 is the default)
* `--verbose` writes debug messages to the console
* `--silent` don't write anything to the console
* `--log=[log file]` log to a given file
* `--modules=[moduleOne],[moduleTwo]` run only selected modules
* `--user-agent='Custom user agent'` provide a custom user agent (will default to something similar to ``phantomas/0.4 (PhantomJS/1.7.0; 64bit)``)

### Multiple runs

This helper script requires NodeJS.

``` bash
./run-multiple.js --url=https://github.com/macbre/phantomas  --runs=5
```

#### Parameters

* `--url` URL of the page to generate metrics for (required)
* `--runs` number of runs to perform (defaults to 3)
* `--modules=[moduleOne],[moduleTwo]` run only selected modules

## Features

* Modular approach - each metric is generated by a separate "module"
* phantomas "core" acts as an [events emitter](https://github.com/macbre/phantomas/wiki/Events) that each module can hook into
* JSON and CSV as available output formats for easy integration with automated reporting / monitoring tools
* Utilities:
 * helper script to run phantomas multiple times
 * CSS analyzer

## Metrics

_Current number of metrics: 71_

Units:

* ms for time
* bytes for size

``` 
./phantomas.js --url=https://github.com/macbre/phantomas

phantomas metrics for <https://github.com/macbre/phantomas>:

* requests: 13
* gzipRequests: 6
* postRequests: 0
* redirects: 0
* notFound: 0
* timeToFirstByte: 781
* timeToLastByte: 789
* bodySize: 398654
* contentLength: 418082
* ajaxRequests: 0
* htmlCount: 1
* htmlSize: 59041
* cssCount: 2
* cssSize: 163000
* jsCount: 4
* jsSize: 124844
* imageCount: 5
* imageSize: 22425
* webfontCount: 1
* webfontSize: 4096
* base64Count: 0
* base64Size: 0
* otherCount: 1
* otherSize: 29344
* cacheHits: 7
* cacheMisses: 0
* cachingNotSpecified: 3
* cachingTooShort: 2
* cachingDisabled: 0
* headersCount: 225
* headersSentCount: 38
* headersRecvCount: 187
* headersSize: 7477
* headersSentSize: 1591
* headersRecvSize: 5886
* assetsNotGzipped: 1
* assetsWithQueryString: 3
* smallImages: 2
* multipleRequests: 0
* timeToFirstCss: 1068
* timeToFirstJs: 1156
* timeToFirstImage: 1537
* httpTrafficCompleted: 2521
* domains: 6
* DOMqueries: 16
* DOMinserts: 17
* jQuerySelectors: 0
* jQueryOnDOMReadyFunctions: 0
* cookiesSent: 0
* cookiesRecv: 434
* domainsWithCookies: 1
* documentCookiesLength: 268
* documentCookiesCount: 8
* bodyHTMLSize: 54965
* commentsSize: 245
* hiddenContentSize: 7799
* whiteSpacesSize: 3271
* DOMelementsCount: 689
* DOMelementMaxDepth: 12
* iframesCount: 0
* nodesWithInlineCSS: 6
* imagesWithoutDimensions: 1
* globalVariables: 24
* localStorageEntries: 0
* smallestResponse: 35
* biggestResponse: 82017
* fastestResponse: 35
* slowestResponse: 1167
* medianResponse: 315
* onDOMReadyTime: 178
* windowOnLoadTime: 1326
```

### Requests monitor (core module)

* requests: total number of HTTP requests made
* gzipRequests: number of gzipped HTTP responses
* postRequests: number of POST requests
* redirects: number of HTTP redirects (either 301 or 302)
* notFound: number of HTTP 404 responses
* timeToFirstByte: time it took to receive the first byte of the first response
* timeToLastByte: time it took to receive the last byte of the first response
* bodySize: size of the content of all responses
* contentLength: size of the content of all responses (based on ``Content-Length`` header)
* httpTrafficCompleted: time it took to receive the last byte of the last HTTP response

### AJAX requests

* ajaxRequests: number of AJAX requests

### Assets types

* htmlCount: number of html responses
* htmlSize: size of html responses
* cssCount: number of css responses
* cssSize: size of css responses
* jsCount: number of js responses
* jsSize: size of js responses
* imageCount: number of image responses
* imageSize: size of image responses
* webfontCount: number of web font responses
* webfontSize: size of web font responses
* base64Count: number of base64 encoded "responses" (no HTTP request was actually made)
* base64Size: size of base64 encoded "responses"
* otherCount: number of other responses
* otherSize: size of other responses

### Cache Hits

_Metrics are calculated based on ``X-Cache`` header added by Varnish  / Squid servers._

* cacheHits: number of cache hits
* cacheMisses: number of cache misses

### Headers

* headersCount: number of requests and responses headers
* headersSentCount: number of headers sent in requests
* headersRecvCount: number of headers received in responses
* headersSize: size of all headers
* headersSentSize: size of sent headers
* headersRecvSize: size of received headers

### Domains

* domains: number of domains used to fetch the page

### Cookies

* cookiesSent: length of cookies sent in HTTP requests
* cookiesRecv: length of cookies received in HTTP responses
* domainsWithCookies: number of domains with cookies set
* documentCookiesLength: length of `document.cookie`
* documentCookiesCount: number of cookies in `document.cookie`

### DOM complexity

* globalVariables: number of JS globals variables
* bodyHTMLSize: the size of body tag content
* commentsSize: the size of HTML comments on the page
* hiddenContentSize: the size of content of hidden elements on the page (with CSS ``display: none``)
* whiteSpacesSize: the size of text nodes with whitespaces only
* DOMelementsCount: total number of HTML element nodes
* DOMelementMaxDepth: maximum level on nesting of HTML element node
* iframesCount: number of iframe nodes
* nodesWithInlineCSS: number of nodes with inline CSS styling (with `style` attribute)
* imagesWithoutDimensions: number of ``<img>`` nodes without both ``width`` and ``height`` attribute

### DOM queries

* DOMqueries: number of `document.getElementById` and `document.getElementsByClassName` calls
* DOMinserts: number of DOM nodes inserts
* jQuerySelectors: number of jQuery selectors calls (e.g. `$('#foo > .bar')`)
* jQueryOnDOMReadyFunctions: number of functions bound to onDOMready event

### Window performance

* onDOMReadyTime: time it took to fire onDOMready event
* windowOnLoadTime: time it took to fire window.load event

### Requests statistics

* smallestResponse: the size of the smallest response
* biggestResponse: the size of the biggest response
* fastestResponse: the time to the last byte of the fastest response
* slowestResponse: the time to the last byte of the slowest response
* medianResponse: median value of time to the last byte for all responses

### localStorage

* localStorageEntries: number of entries in local storage

### Static assets

* assetsNotGzipped: static assets that were not gzipped
* assetsWithQueryString: static assets requested with query string (e.g. ?foo) in URL
* smallImages: images smaller than 2 kB that can be base64 encoded
* multipleRequests: number of static assets that are requested more than once

### Caching

* cachingNotSpecified: responses with no caching header sent (either `Cache-Control` or `Expires`)
* cachingTooShort: responses with too short (less than a week) caching time
* cachingDisabled: responses with caching disabled (`max-age=0`)

### Time to first asset

* timeToFirstCss: time it took to receive the last byte of the first CSS
* timeToFirstJs: time it took to receive the last byte of the first JS
* timeToFirstImage: time it took to receive the last byte of the first image

## Notices

phantomas apart from "raw" metrics data, when in `--verbose` mode, emits notices with more in-depth data:

```
> Caching period is less than a week for <https://ssl.google-analytics.com/ga.js> (set to 43200 s)
> No caching specified for <https://secure.gaug.es/track.js>
> Caching period is less than a week for <https://secure.gravatar.com/avatar/57548e3255bfa0e74afff98289dae839?s=140&d=https://a248.e.akamai.net/assets.github.com%2Fimages%2Fgravatars%2Fgravatar-user-420.png> (set to 300 s)
> https://secure.gravatar.com/avatar/57548e3255bfa0e74afff98289dae839?s=140&d=https://a248.e.akamai.net/assets.github.com%2Fimages%2Fgravatars%2Fgravatar-user-420.png (IMAGE) served with query string
> Requests per domain:
>  github.com: 1 request(s)
>  a248.e.akamai.net: 16 request(s)
>  ssl.google-analytics.com: 2 request(s)
>  secure.gaug.es: 2 request(s)
>  secure.gravatar.com: 1 request(s)
>
> JavaScript globals (18): html5, Modernizr, moment, $, jQuery, $stats, jQuery18302483161953277886, GitHub, DateInput, clippyCopiedCallback, debug, _gaq, _gauges, CommandBar, stringDistance, fuzzyScore, _gat, gaGlobal
>
> The smallest response (0.03 kB): https://ssl.google-analytics.com/__utm.gif?utmwv=5.3.8&utms=1&utmn=396347331&utmhn=github.com&utmcs=UTF-8&utmsr=1024x768&utmvp=1024x1280&utmsc=32-bit&utmul=pl-pl&utmje=0&utmfl=-&utmdt=macbre%2Fphantomas%20%C2%B7%20GitHub&utmhid=1963809109&utmr=-&utmp=%2Fmacbre%2Fphantomas&utmac=UA-3769691-2&utmcc=__utma%3D1.1523233271.1353260190.1353260190.1353260190.1%3B%2B__utmz%3D1.1353260190.1.1.utmcsr%3D(direct)%7Cutmccn%3D(direct)%7Cutmcmd%3D(none)%3B&utmu=qB~
> The biggest response (233.84 kB): https://a248.e.akamai.net/assets.github.com/assets/github-81433815e4751f68e04d42ec948cba14ab028c2d.js
>
> The fastest response (43 ms): https://a248.e.akamai.net/assets.github.com/images/modules/header/logov7@4x.png?1340659561
> The slowest response (984 ms): https://secure.gravatar.com/avatar/57548e3255bfa0e74afff98289dae839?s=140&d=https://a248.e.akamai.net/assets.github.com%2Fimages%2Fgravatars%2Fgravatar-user-420.png
```

## For developers

* [Project's wiki](https://github.com/macbre/phantomas/wiki)
* Description of [events fired by phantomas core](https://github.com/macbre/phantomas/wiki/Events)
* [TODO list](https://github.com/macbre/phantomas/wiki/TODO)

## Utilities

### CSS analyzer

phantomas comes with nodejs script that can analyze the complexity of CSS stylesheet (local file or fetched via HTTP).

```
./analyze-css.js --url "https://github.global.ssl.fastly.net/assets/github2-d35b02ba3940bde9b9f2c3e58f2dfb1ceff5886c.css" --json
```
```json
{"cssLength":176896,"selectorsTotal":2359,"selectorsPartsTotal":5703,"declarationsTotal":5188,"complexSelectors":300,"qualifiedRules":745,"oldIEFixes":0,"selectorsByTag":1523,"selectorsByClass":4373,"selectorsById":543,"selectorsByPseudo":291,"importantsTotal":9}
```

will emit CSS metrics as JSON-encoded object that you can easily plug into your monitoring tools.

```
./analyze-css.js --url "https://github.global.ssl.fastly.net/assets/github2-d35b02ba3940bde9b9f2c3e58f2dfb1ceff5886c.css" --verbose
```

will emit additional messages that can help you optimize your CSS.

#### Parameters

* `--url` fetch CSS via HTTP
* `--file` analyze local CSS file
* `--json` output results in JSON format
* `--verbose` emit additional messages
* `--bw` don't color additional messages

Run `./analyze-css.js --help` to get the list of supported parameters.

#### Metrics

CSS analyzer provides the following metrics:

* cssLength: length of analyzed CSS file (including comments and whitespaces)
* selectorsTotal: total number of selectors (`.foo, .bar` counts as two)
* selectorsPartsTotal: total number of selectors parts (`ul > .bar > a` counts as three)
* declarationsTotal: total number of properties defined in CSS file
* complexSelectors: number of complex selectors (consisting of three or more parts)
* qualifiedRules: number of selectors that are mix of either ID and tag name, ID and class or class and tag name
* oldIEFixes: number of properties that are prefixed with asterisk (hacky fix for IE7 and below)
* selectorsByTag: number of selectors by tag name
* selectorsByClass: number of selectors by class
* selectorsById: number of selectors by ID
* selectorsByPseudo: number of pseudo-selectors (`:hover`)
* importantsTotal: number of properties with value forced by `!important`
