Modules and metrics
===================

This file describes all [`phantomas` modules](https://github.com/macbre/phantomas/tree/devel/modules) (36 of them) and 187 metrics that they emit.

When applicable, [offender](https://github.com/macbre/phantomas/issues/140) example is provided.



## [ajaxRequests](https://github.com/macbre/phantomas/tree/devel/modules/ajaxRequests/ajaxRequests.js)

> Analyzes AJAX requests

##### `ajaxRequests`

number of AJAX requests (number, with offenders)

```json
{
  "url": "/static/style.css",
  "method": "POST"
}
```

##### `synchronousXHR`

number of synchronous XMLHttpRequest (number, with offenders)

```json
{
  "url": "inline-css.html",
  "method": "GET"
}
```


## [alerts](https://github.com/macbre/phantomas/tree/devel/modules/alerts/alerts.js)

> Meters number of invocations of window.alert, window.confirm, and
window.prompt.

##### `windowAlerts`

number of calls to window.alert (number, with offenders)

```json
"Oh dear!"
```

##### `windowConfirms`

number of calls to window.confirm (number, with offenders)

```json
"Oh dear?"
```

##### `windowPrompts`

number of calls to window.prompt (number, with offenders)

```json
"What's your name, dear?"
```


## [analyzeCss](https://github.com/macbre/phantomas/tree/devel/modules/analyzeCss/analyzeCss.js)

> Adds CSS complexity metrics using analyze-css npm module.
Run phantomas with --analyze-css option to use this module

##### `cssBase64Length`

total length of base64-encoded data in CSS source (will warn about base64-encoded data bigger than 4 kB) (bytes, with offenders)

##### `cssColors`

number of unique colors used in CSS (number, with offenders)

##### `cssComments`

number of comments in CSS source (number, with offenders)

##### `cssCommentsLength`

length of comments content in CSS source (bytes)

##### `cssComplexSelectorsByAttribute`

number of selectors with complex matching by attribute (e.g. [class$="foo"]) (number, with offenders)

##### `cssDeclarations`

number of declarations (e.g. .foo, .bar { color: red } is counted as one declaration - color: red) (number, with offenders)

##### `cssDuplicatedProperties`

number of CSS property definitions duplicated within a selector (number, with offenders)

##### `cssDuplicatedSelectors`

number of CSS selectors defined more than once in CSS source (number, with offenders)

##### `cssEmptyRules`

number of rules with no properties (e.g. .foo { }) (number, with offenders)

##### `cssExpressions`

number of rules with CSS expressions (e.g. expression( document.body.clientWidth > 600 ? "600px" : "auto" )) (number, with offenders)

##### `cssImportants`

number of properties with value forced by !important (number, with offenders)

##### `cssImports`

number of @import rules (number, with offenders)

##### `cssInlineStyles`

number of inline styles (number)

##### `cssLength`

length of CSS source (in bytes) (bytes, with offenders)

##### `cssMediaQueries`

number of media queries (e.g. @media screen and (min-width: 1370px)) (number, with offenders)

##### `cssMultiClassesSelectors`

number of selectors with multiple classes (e.g. span.foo.bar) (number, with offenders)

##### `cssNotMinified`

set to 1 if the provided CSS is not minified (number, with offenders)

##### `cssOldIEFixes`

number of fixes for old versions of Internet Explorer (e.g. * html .foo {} and .foo { *zoom: 1 }) (number, with offenders)

##### `cssOldPropertyPrefixes`

number of properties with no longer needed vendor prefix, powered by data provided by autoprefixer (e.g. --moz-border-radius) (number, with offenders)

##### `cssParsingErrors`

number of CSS files (or embeded CSS) that failed to be parse by analyze-css (number, with offenders)

```json
{
  "url": "[inline CSS]",
  "value": {
    "message": "Empty sub-selector",
    "position": {
      "end": {
        "column": 43,
        "line": 2
      },
      "source": "undefined",
      "start": {
        "column": 14,
        "line": 2
      }
    }
  }
}
```

##### `cssQualifiedSelectors`

number of qualified selectors (e.g. header#nav, .foo#bar, h1.title) (number, with offenders)

##### `cssRedundantBodySelectors`

number of redundant body selectors (e.g. body .foo, section body h2, but not body > h1) (number, with offenders)

##### `cssRules`

number of rules (e.g. .foo, .bar { color: red } is counted as one rule) (number, with offenders)

##### `cssSelectorLengthAvg`

average length of selector (e.g. for ``.foo .bar, #test div > span { color: red }`` will be set as 2.5) (number, with offenders)

##### `cssSelectors`

number of selectors (e.g. .foo, .bar { color: red } is counted as two selectors - .foo and .bar) (number, with offenders)

##### `cssSelectorsByAttribute`

number of selectors by attribute (e.g. .foo[value=bar]) (number)

##### `cssSelectorsByClass`

number of selectors by class (number)

##### `cssSelectorsById`

number of selectors by ID (number)

##### `cssSelectorsByPseudo`

number of pseudo-selectors (e,g. :hover) (number)

##### `cssSelectorsByTag`

number of selectors by tag name (number)

##### `cssSpecificityClassAvg`

average specificity for class, pseudo-class or attribute (number, with offenders)

##### `cssSpecificityClassTotal`

total specificity for class, pseudo-class or attribute (number)

##### `cssSpecificityIdAvg`

average specificity for ID (number, with offenders)

##### `cssSpecificityIdTotal`

total specificity for ID (number)

##### `cssSpecificityTagAvg`

average specificity for element (number, with offenders)

##### `cssSpecificityTagTotal`

total specificity for element (number)

##### `redundantChildNodesSelectors`

number of redundant child nodes selectors (number, with offenders)


## [assetsTypes](https://github.com/macbre/phantomas/tree/devel/modules/assetsTypes/assetsTypes.js)

> Analyzes number of requests and sizes of different types of assets

##### `base64Count`

number of base64 encoded "responses" (no HTTP request was actually made) (number, with offenders)

##### `base64Size`

size of base64 encoded responses (bytes)

##### `cssCount`

number of CSS responses (number, with offenders)

```json
{
  "url": "http://127.0.0.1:8888/static/style.css",
  "size": 320
}
```

##### `cssSize`

size of CSS responses (with compression) (bytes)

##### `htmlCount`

number of HTML responses (number, with offenders)

```json
{
  "url": "http://127.0.0.1:8888/dom-operations.html",
  "size": 946
}
```

##### `htmlSize`

size of HTML responses (with compression) (bytes)

##### `imageCount`

number of image responses (number, with offenders)

```json
{
  "url": "http://127.0.0.1:8888/static/blank.gif",
  "size": 342
}
```

##### `imageSize`

size of image responses (with compression) (bytes)

##### `jsCount`

number of JS responses (number, with offenders)

```json
{
  "url": "http://127.0.0.1:8888/static/jquery-2.1.1.min.js",
  "size": 29734
}
```

##### `jsSize`

size of JS responses (with compression) (bytes)

##### `jsonCount`

number of JSON responses (number, with offenders)

```json
{
  "url": "http://127.0.0.1:8888/foo.json",
  "size": 345
}
```

##### `jsonSize`

size of JSON responses (with compression) (bytes)

##### `otherCount`

number of other responses (number, with offenders)

##### `otherSize`

size of other responses (with compression) (bytes)

##### `videoCount`

number of video responses (number, with offenders)

```json
{
  "url": "http://127.0.0.1:8888/static/stickman.webm",
  "size": 3750
}
```

##### `videoSize`

size of video responses (with compression) (bytes)

##### `webfontCount`

number of web font responses (number, with offenders)

##### `webfontSize`

size of web font responses (with compression) (bytes)


## [blockDomains](https://github.com/macbre/phantomas/tree/devel/modules/blockDomains/blockDomains.js)

> Aborts requests to external resources or given domains
Does not emit any metrics

##### `blockedRequests`

number of requests blocked due to domain filtering (number, with offenders)

```json
"http://code.jquery.com/jquery-1.11.1.js"
```


## [cacheHits](https://github.com/macbre/phantomas/tree/devel/modules/cacheHits/cacheHits.js)

> Analyzes Age and X-Cache headers from caching servers like Squid or Varnish

##### `cacheHits`

number of cache hits (number, with offenders)

##### `cacheMisses`

number of cache misses (number, with offenders)

##### `cachePasses`

number of cache passes (number, with offenders)


## [caching](https://github.com/macbre/phantomas/tree/devel/modules/caching/caching.js)

> Analyzes HTTP caching headers

##### `cachingDisabled`

number of responses with caching disabled (max-age=0) (number, with offenders)

```json
"http://0.0.0.0:8888/static/mdn-no-cache.png"
```

##### `cachingNotSpecified`

number of responses with no caching header sent (no Cache-Control header) (number, with offenders)

```json
"http://0.0.0.0:8888/static/jquery-1.4.4.min.js"
```

##### `cachingTooShort`

number of responses with too short (less than a week) caching time (number, with offenders)

```json
{
  "url": "http://127.0.0.1:8888/static/mdn.png",
  "ttl": 86400
}
```

##### `cachingUseImmutable`

number of responses with a long TTL that can benefit from Cache-Control: immutable (number, with offenders)

```json
{
  "url": "http://code.jquery.com/jquery-1.4.4.js",
  "ttl": 315360000
}
```

##### `oldCachingHeaders`

number of responses with old, HTTP 1.0 caching headers (Expires and Pragma) (number, with offenders)

```json
{
  "url": "http://0.0.0.0:8888/_make_docs.html",
  "headerName": "expires",
  "value": "Thu, 05 May 2022 22:02:04 GMT"
}
```


## [console](https://github.com/macbre/phantomas/tree/devel/modules/console/console.js)

> Meters number of console logs

##### `consoleMessages`

number of calls to console.* functions (number, with offenders)

```json
"log:[\"Hi!\"]"
```


## [cookies](https://github.com/macbre/phantomas/tree/devel/modules/cookies/cookies.js)

> cookies metrics

##### `cookiesRecv`

length of cookies received in HTTP responses (bytes)

##### `cookiesSent`

length of cookies sent in HTTP requests (bytes)

##### `documentCookiesCount`

number of cookies in document.cookie (number)

##### `documentCookiesLength`

length of document.cookie (bytes)

##### `domainsWithCookies`

number of domains with cookies set (number, with offenders)


## [cpuTasks](https://github.com/macbre/phantomas/tree/devel/modules/cpuTasks/cpuTasks.js)

> 

##### `layoutCount`

total number of full or partial page layout (number)

##### `layoutDuration`

combined durations of all page layouts (ms)

##### `recalcStyleCount`

total number of page style recalculations (number)

##### `recalcStyleDuration`

combined duration of style recalculations (ms)

##### `scriptDuration`

combined duration of JavaScript execution (ms)

##### `taskDuration`

combined duration of all tasks performed by the browser (ms)


## [documentHeight](https://github.com/macbre/phantomas/tree/devel/modules/documentHeight/documentHeight.js)

> Measure document height

##### `documentHeight`

the page height (px)


## [domComplexity](https://github.com/macbre/phantomas/tree/devel/modules/domComplexity/domComplexity.js)

> Analyzes DOM complexity

##### `DOMelementMaxDepth`

maximum level on nesting of HTML element node (number, with offenders)

```json
"body > script[0]"
```

##### `DOMelementsCount`

total number of HTML element nodes (number)

##### `DOMidDuplicated`

number of duplicated IDs found in DOM (number, with offenders)

```json
{
  "id": "img",
  "count": 2
}
```

##### `bodyHTMLSize`

the size of body tag content (document.body.innerHTML.length) (bytes)

##### `commentsSize`

the size of HTML comments on the page (bytes, with offenders)

##### `iframesCount`

number of iframe nodes (number, with offenders)

```json
{
  "element": "body > iframe[1]",
  "url": "http://127.0.0.1:8888/image-scaling.html"
}
```

##### `imagesScaledDown`

number of <img> nodes that have images scaled down in HTML (number, with offenders)

```json
{
  "url": "http://127.0.0.1:8888/static/mdn.png",
  "naturalWidth": 600,
  "naturalHeight": 529,
  "imgWidth": 300,
  "imgHeight": 265
}
```

##### `imagesWithoutDimensions`

number of <img> nodes without both width and height attribute (number, with offenders)

```json
"%s <%s>"
```

##### `nodesWithInlineCSS`

number of nodes with inline CSS styling (with style attribute) (number, with offenders)

```json
{
  "css": "color: blue",
  "node": "p#foo"
}
```

##### `whiteSpacesSize`

the size of text nodes with whitespaces only (bytes)


## [domHiddenContent](https://github.com/macbre/phantomas/tree/devel/modules/domHiddenContent/domHiddenContent.js)

> Analyzes DOM hidden content

##### `hiddenContentSize`

the size of content of hidden elements on the page (with CSS display: none) (bytes, with offenders)

##### `hiddenImages`

number of hidden images that can be lazy-loaded (number, with offenders)

```json
"http://127.0.0.1:8888/static/mdn.png"
```


## [domMutations](https://github.com/macbre/phantomas/tree/devel/modules/domMutations/domMutations.js)

> Analyzes DOM changes via MutationObserver API

##### `DOMmutationsAttributes`

number of DOM nodes attributes changes (number, with offenders)

```json
{
  "attribute": "style",
  "node": "body"
}
```

##### `DOMmutationsInserts`

number of <body> node inserts (number, with offenders)

```json
{
  "node": "strong[0]",
  "target": "p#foo"
}
```

##### `DOMmutationsRemoves`

number of <body> node removes (number, with offenders)

```json
{
  "node": "span#delete",
  "target": "body"
}
```


## [domQueries](https://github.com/macbre/phantomas/tree/devel/modules/domQueries/domQueries.js)

> Analyzes DOM queries done via native DOM methods

##### `DOMinserts`

number of DOM nodes inserts (number, with offenders)

```json
{
  "append": "html > div[2]",
  "node": "html"
}
```

##### `DOMqueries`

number of all DOM queries (number, with offenders)

##### `DOMqueriesAvoidable`

number of repeated uses of a duplicated query (number)

##### `DOMqueriesByClassName`

number of document.getElementsByClassName calls (number, with offenders)

```json
{
  "class": "barr",
  "node": "body"
}
```

##### `DOMqueriesById`

number of document.getElementById calls (number, with offenders)

```json
{
  "id": "foo",
  "node": "#document"
}
```

##### `DOMqueriesByQuerySelectorAll`

number of document.querySelector(All) calls (number, with offenders)

```json
{
  "selector": ".TEST",
  "node": "div"
}
```

##### `DOMqueriesByTagName`

number of document.getElementsByTagName calls (number, with offenders)

```json
{
  "tag": "*",
  "node": "div"
}
```

##### `DOMqueriesDuplicated`

number of DOM queries called more than once (number, with offenders)

```json
{
  "query": "id \"#foo\" (in #document)",
  "count": 2
}
```

##### `DOMqueriesWithoutResults`

number of DOM queries that returned nothing (number, with offenders)

```json
{
  "query": "#script1651701724900",
  "node": "#document",
  "function": "getElementById"
}
```


## [domains](https://github.com/macbre/phantomas/tree/devel/modules/domains/domains.js)

> Domains monitor

##### `domains`

number of domains used to fetch the page (number, with offenders)

```json
{
  "domain": "127.0.0.1",
  "requests": 2
}
```

##### `maxRequestsPerDomain`

maximum number of requests fetched from a single domain (number)

##### `medianRequestsPerDomain`

median of number of requests fetched from each domain (number)


## [events](https://github.com/macbre/phantomas/tree/devel/modules/events/events.js)

> Analyzes events bound to DOM elements

##### `eventsBound`

number of EventTarget.addEventListener calls (number, with offenders)

```json
{
  "eventType": "load",
  "path": "window"
}
```

##### `eventsDispatched`

number of EventTarget.dispatchEvent calls (number, with offenders)

```json
{
  "eventType": "click",
  "path": "body > div#foo > span.bar"
}
```

##### `eventsScrollBound`

number of scroll event bounds (number, with offenders)

```json
{
  "element": "#document"
}
```


## [globalVariables](https://github.com/macbre/phantomas/tree/devel/modules/globalVariables/globalVariables.js)

> Counts global JavaScript variables

##### `globalVariables`

number of JS globals variables (number, with offenders)

```json
"jQuery"
```

##### `globalVariablesFalsy`

number of JS globals variables with falsy value (number, with offenders)

```json
{
  "name": "falsy",
  "value": false
}
```


## [headers](https://github.com/macbre/phantomas/tree/devel/modules/headers/headers.js)

> Analyzes HTTP headers in both requests and responses

##### `headersBiggerThanContent`

number of responses with headers part bigger than the response body (number, with offenders)

##### `headersCount`

number of requests and responses headers (number)

##### `headersRecvCount`

number of headers received in responses (number)

##### `headersRecvSize`

size of received headers (bytes)

##### `headersSentCount`

number of headers sent in requests (number)

##### `headersSentSize`

size of sent headers (bytes)

##### `headersSize`

size of all headers (bytes)


## [jQuery](https://github.com/macbre/phantomas/tree/devel/modules/jQuery/jQuery.js)

> Analyzes jQuery activity

##### `jQueryDOMReads`

number of DOM read operations (number, with offenders)

```json
{
  "functionName": "css",
  "arguments": "[\"color\"]",
  "contextPath": "body > div#foo > span.bar"
}
```

##### `jQueryDOMWriteReadSwitches`

number of read operations that follow a series of write operations (will cause repaint and can cause reflow) (number, with offenders)

```json
{
  "functionName": "css",
  "arguments": "[\"color\"]",
  "contextPath": "body > div#foo > span.bar"
}
```

##### `jQueryDOMWrites`

number of DOM write operations (number, with offenders)

```json
{
  "functionName": "css",
  "arguments": "[{\"color\":\"red\",\"background\":\"green\"}]",
  "contextPath": "body > div#foo > span.bar"
}
```

##### `jQueryEventTriggers`

number of jQuery event triggers (number, with offenders)

```json
{
  "type": "click",
  "element": "body > div#foo > span.bar"
}
```

##### `jQueryOnDOMReadyFunctions`

number of functions bound to onDOMReady event (number, with offenders)

```json
"HTMLDocument.DOMContentLoaded (http://code.jquery.com/jquery-1.4.4.js:875:10)"
```

##### `jQuerySizzleCalls`

number of calls to Sizzle (including those that will be resolved using querySelectorAll) (number, with offenders)

```json
{
  "selector": "#foo .bar",
  "element": "#document"
}
```

##### `jQueryVersion`

version of jQuery framework (if loaded) (string)

##### `jQueryVersionsLoaded`

number of loaded jQuery "instances" (even in the same version) (number, with offenders)

```json
{
  "version": "2.1.1",
  "url": "http://127.0.0.1:8888/static/jquery-2.1.1.min.js"
}
```

##### `jQueryWindowOnLoadFunctions`

number of functions bound to windowOnLoad event (number, with offenders)

```json
"http://127.0.0.1:8888/jquery.html:49:13"
```


## [javaScriptBottlenecks](https://github.com/macbre/phantomas/tree/devel/modules/javaScriptBottlenecks/javaScriptBottlenecks.js)

> Reports the use of functions known to be serious performance bottlenecks in JS
Run phantomas with --spy-eval to count eval() calls (see issue #467)

##### `documentWriteCalls`

number of calls to either document.write or document.writeln (number, with offenders)

```json
{
  "message": "document.write() used",
  "caller": "http://127.0.0.1:8888/bottlenecks.html:11:11"
}
```

##### `evalCalls`

number of calls to eval (either direct or via setTimeout / setInterval) (number, with offenders)

```json
{
  "message": "eval() called directly",
  "caller": "http://127.0.0.1:8888/bottlenecks.html:8:2"
}
```


## [jserrors](https://github.com/macbre/phantomas/tree/devel/modules/jserrors/jserrors.js)

> Meters the number of page errors, and provides traces as offenders for "jsErrors" metric

##### `jsErrors`

number of JavaScript errors (number, with offenders)

```json
"ReferenceError: unknown_function_called is not defined -     at http://0.0.0.0:8888/_make_docs.html:31:3"
```


## [keepAlive](https://github.com/macbre/phantomas/tree/devel/modules/keepAlive/keepAlive.js)

> Analyzes if HTTP responses keep the connections alive.

##### `closedConnections`

number of requests not keeping the connection alive and slowing down the next request (number, with offenders)


## [lazyLoadableImages](https://github.com/macbre/phantomas/tree/devel/modules/lazyLoadableImages/lazyLoadableImages.js)

> Analyzes images and detects which one can be lazy-loaded (are below the fold)

##### `lazyLoadableImagesBelowTheFold`

number of images displayed below the fold that can be lazy-loaded (number, with offenders)

```json
{
  "url": "http://127.0.0.1:8888/static/blank.gif",
  "node": "body > img#dot",
  "offset": 900
}
```


## [localStorage](https://github.com/macbre/phantomas/tree/devel/modules/localStorage/localStorage.js)

> localStorage metrics

##### `localStorageEntries`

number of entries in local storage (number, with offenders)

```json
"foo"
```


## [mainRequest](https://github.com/macbre/phantomas/tree/devel/modules/mainRequest/mainRequest.js)

> Analyzes bits of data pertaining to the main request only

##### `statusCodesTrail`

comma-separated list of HTTP status codes that main request followed through (could contain a single element if the main request is a terminal one) (string)


## [navigationTiming](https://github.com/macbre/phantomas/tree/devel/core/modules/navigationTiming/navigationTiming.js)

> Emits "milestone" event on Navigation Timing related events:
- domContentLoaded
- domInteractive
- domComplete
Code taken from windowPerformance module


## [protocols](https://github.com/macbre/phantomas/tree/devel/modules/protocols/protocols.js)

> Checks versions of HTTP and TLS protocols

##### `mainDomainHttpProtocol`

HTTP protocol used by the main domain (string)

##### `mainDomainTlsProtocol`

TLS protocol used by the main domain (string)

##### `oldHttpProtocol`

number of domains using HTTP/1.0 or 1.1 (number, with offenders)

```json
{
  "domain": "https://127.0.0.1",
  "httpVersion": "http/1.1",
  "requests": 1
}
```

##### `oldTlsProtocol`

number of domains using TLS 1.2 (number, with offenders)

```json
{
  "domain": "https://127.0.0.1",
  "tlsVersion": "TLS 1.2",
  "beforeDomReady": true
}
```


## [redirects](https://github.com/macbre/phantomas/tree/devel/modules/redirects/redirects.js)

> Analyzes HTTP redirects

##### `redirects`

number of HTTP redirects (either 301, 302 or 303) (number, with offenders)

##### `redirectsTime`

time it took to send and receive redirects (ms)


## [requestsMonitor](https://github.com/macbre/phantomas/tree/devel/core/modules/requestsMonitor/requestsMonitor.js)

> Simple HTTP requests monitor and analyzer

##### `bodySize`

size of the uncompressed content of all responses (bytes)

##### `contentLength`

size of the compressed content of all responses, i.e. what was transfered in packets (bytes)

##### `gzipRequests`

number of gzipped HTTP responses (number, with offenders)

```json
{
  "url": "http://127.0.0.1:8888/dom-operations.html",
  "bodySize": 2094,
  "transferedSize": 946
}
```

##### `httpTrafficCompleted`

time it took to receive the last byte of the last HTTP response (ms)

##### `httpsRequests`

number of HTTPS requests (number, with offenders)

```json
"https://httpbin.org/basic-auth/foo/bar"
```

##### `notFound`

number of HTTP 404 responses (number, with offenders)

```json
"http://127.0.0.1:8888/not_found/foo.js"
```

##### `postRequests`

number of POST requests (number, with offenders)

```json
"http://127.0.0.1:8888/static/style.css"
```

##### `requests`

total number of HTTP requests made (number, with offenders)

```json
{
  "url": "http://127.0.0.1:8888/not-found.html",
  "type": "html",
  "size": 380
}
```


## [requestsStats](https://github.com/macbre/phantomas/tree/devel/modules/requestsStats/requestsStats.js)

> Analyzes HTTP requests and generates stats metrics

##### `biggestLatency`

the time to the first byte of the slowest response (ms, with offenders)

```json
{
  "url": "http://0.0.0.0:8888/static/mdn-short-cache.png",
  "timeToFirstByte": 106.421
}
```

##### `biggestResponse`

the size of the biggest response (bytes, with offenders)

```json
{
  "url": "http://127.0.0.1:8888/headers.html",
  "size": 856
}
```

##### `fastestResponse`

the time to the last byte of the fastest response (ms, with offenders)

```json
{
  "url": "http://0.0.0.0:8888/foo.json",
  "timeToLastByte": 0.009596999996574596
}
```

##### `medianLatency`

median value of time to the first byte for all responses (ms, with offenders)

##### `medianResponse`

median value of time to the last byte for all responses (ms, with offenders)

##### `slowestResponse`

the time to the last byte of the slowest response (ms, with offenders)

```json
{
  "url": "http://code.jquery.com/jquery-1.4.4.js",
  "timeToLastByte": 0.19129599997540936
}
```

##### `smallestLatency`

the time to the first byte of the fastest response (ms, with offenders)

```json
{
  "url": "http://0.0.0.0:8888/foo.json",
  "timeToFirstByte": 7.045
}
```

##### `smallestResponse`

the size of the smallest response (bytes, with offenders)

```json
{
  "url": "http://127.0.0.1:8888/static/blank.gif",
  "size": 342
}
```


## [requestsTo](https://github.com/macbre/phantomas/tree/devel/modules/requestsTo/requestsTo.js)

> Number of requests it took to make the page enter DomContentLoaded and DomComplete states accordingly

##### `domainsToDomComplete`

number of domains used to make the page reach DomComplete state (number, with offenders)

```json
{
  "domain": "127.0.0.1",
  "requests": 2
}
```

##### `domainsToDomContentLoaded`

number of domains used to make the page reach DomContentLoaded state (number, with offenders)

```json
{
  "domain": "127.0.0.1",
  "requests": 2
}
```

##### `domainsToFirstPaint`

number of domains used to make the first paint (number, with offenders)

##### `requestsToDomComplete`

number of HTTP requests it took to make the page reach DomComplete state (number)

##### `requestsToDomContentLoaded`

number of HTTP requests it took to make the page reach DomContentLoaded state (number)

##### `requestsToFirstPaint`

number of HTTP requests it took to make the first paint (number)


## [staticAssets](https://github.com/macbre/phantomas/tree/devel/modules/staticAssets/staticAssets.js)

> Analyzes static assets (CSS, JS and images)

##### `assetsNotGzipped`

number of static assets that were not gzipped (number, with offenders)

```json
{
  "url": "http://127.0.0.1:8888/static/jquery-1.4.4.min.js",
  "contentType": "application/javascript"
}
```

##### `assetsWithCookies`

number of static assets requested from domains with cookie set (number, with offenders)

##### `assetsWithQueryString`

number of static assets requested with query string (e.g. ?foo) in URL (number, with offenders)

```json
{
  "url": "http://127.0.0.1:8888/static/mdn.png?cb=123",
  "contentType": "image/png"
}
```

##### `multipleRequests`

number of static assets that are requested more than once (number, with offenders)

##### `smallCssFiles`

number of CSS assets smaller than 2 KiB that can be inlined or merged (number, with offenders)

```json
{
  "url": "http://127.0.0.1:8888/static/style.css",
  "size": 320
}
```

##### `smallImages`

number of images smaller than 2 KiB that can be base64 encoded (number, with offenders)

```json
{
  "url": "http://127.0.0.1:8888/static/blank.gif",
  "size": 342
}
```

##### `smallJsFiles`

number of JS assets smaller than 2 KiB that can be inlined or merged (number, with offenders)


## [timeToFirst](https://github.com/macbre/phantomas/tree/devel/modules/timeToFirst/timeToFirst.js)

> Provides metrics for time to first image, CSS and JS file

##### `timeToFirstCss`

time it took to receive the last byte of the first CSS (ms, with offenders)

##### `timeToFirstImage`

time it took to receive the last byte of the first image (ms, with offenders)

```json
"http://0.0.0.0:8888/static/mdn.png received in NaN ms"
```

##### `timeToFirstJs`

time it took to receive the last byte of the first JS (ms, with offenders)

```json
"http://0.0.0.0:8888/static/jquery-2.1.1.min.js received in NaN ms"
```


## [timeToFirstByte](https://github.com/macbre/phantomas/tree/devel/core/modules/timeToFirstByte/timeToFirstByte.js)

> Takes a look at "time to first (last) byte" metrics

##### `timeToFirstByte`

time it took to receive the first byte of the first response (that was not a redirect) (ms)

##### `timeToLastByte`

time it took to receive the last byte of the first response (that was not a redirect) (ms)


## [windowPerformance](https://github.com/macbre/phantomas/tree/devel/modules/windowPerformance/windowPerformance.js)

> Measure when the page reaches certain states

##### `domComplete`

time it took to load all page resources, the loading spinner has stopped spinning (ms)

##### `domContentLoaded`

time it took to construct both DOM and CSSOM, no stylesheets that are blocking JavaScript execution (i.e. onDOMReady) (ms)

##### `domContentLoadedEnd`

time it took to finish handling of onDOMReady event (ms)

##### `domInteractive`

time it took to parse the HTML and construct the DOM (ms)

##### `performanceTimingConnect`

time it took to connect to the server before making the first HTTP request (ms)

##### `performanceTimingDNS`

time it took to resolve the domain before making the first HTTP request (ms)

##### `performanceTimingPageLoad`

time it took to fully load the page (ms)

##### `performanceTimingTTFB`

time it took to receive the first byte of the first HTTP response (ms)

##### `timeBackend`

time to the first byte compared to the total loading time (%)

##### `timeFrontend`

time to window.load compared to the total loading time (%)

---
> This file is auto-generated from code comments. Please run `npm run make-docs` to update it.