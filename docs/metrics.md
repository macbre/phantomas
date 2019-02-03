Modules and metrics
===================

This fille describes all phantomas modules and metrics that they emit.

## [ajaxRequests](https://github.com/macbre/phantomas/tree/devel/modules/ajaxRequests/ajaxRequests.js)

> Analyzes AJAX requests

##### ``ajaxRequests``

number of AJAX requests (number, with offenders)

## [alerts](https://github.com/macbre/phantomas/tree/devel/modules/alerts/alerts.js)

> Meters number of invocations of window.alert, window.confirm, and
window.prompt.

##### ``windowAlerts``

number of calls to window.alert (number, with offenders)

##### ``windowConfirms``

number of calls to window.confirm (number, with offenders)

##### ``windowPrompts``

number of calls to window.prompt (number, with offenders)

## [analyzeCss](https://github.com/macbre/phantomas/tree/devel/modules/analyzeCss/analyzeCss.js)

> Adds CSS complexity metrics using analyze-css npm module.
Run phantomas with --analyze-css option to use this module

##### ``cssBase64Length``

total length of base64-encoded data in CSS source (will warn about base64-encoded data bigger than 4 kB) (bytes, with offenders)

##### ``cssColors``

number of unique colors used in CSS (number, with offenders)

##### ``cssComments``

number of comments in CSS source (number, with offenders)

##### ``cssCommentsLength``

length of comments content in CSS source (bytes)

##### ``cssComplexSelectorsByAttribute``

number of selectors with complex matching by attribute (e.g. [class$="foo"]) (number, with offenders)

##### ``cssDeclarations``

number of declarations (e.g. .foo, .bar { color: red } is counted as one declaration - color: red) (number, with offenders)

##### ``cssDuplicatedProperties``

number of CSS property definitions duplicated within a selector (number, with offenders)

##### ``cssDuplicatedSelectors``

number of CSS selectors defined more than once in CSS source (number, with offenders)

##### ``cssEmptyRules``

number of rules with no properties (e.g. .foo { }) (number, with offenders)

##### ``cssExpressions``

number of rules with CSS expressions (e.g. expression( document.body.clientWidth > 600 ? "600px" : "auto" )) (number, with offenders)

##### ``cssImportants``

number of properties with value forced by !important (number, with offenders)

##### ``cssImports``

number of @import rules (number, with offenders)

##### ``cssInlineStyles``

number of inline styles (number)

##### ``cssLength``

length of CSS source (in bytes) (bytes, with offenders)

##### ``cssMediaQueries``

number of media queries (e.g. @media screen and (min-width: 1370px)) (number, with offenders)

##### ``cssMultiClassesSelectors``

number of selectors with multiple classes (e.g. span.foo.bar) (number, with offenders)

##### ``cssNotMinified``

set to 1 if the provided CSS is not minified (number, with offenders)

##### ``cssOldIEFixes``

number of fixes for old versions of Internet Explorer (e.g. * html .foo {} and .foo { *zoom: 1 }) (number, with offenders)

##### ``cssOldPropertyPrefixes``

number of properties with no longer needed vendor prefix, powered by data provided by autoprefixer (e.g. --moz-border-radius) (number, with offenders)

##### ``cssParsingErrors``

number of CSS files (or embeded CSS) that failed to be parse by analyze-css (number, with offenders)

##### ``cssQualifiedSelectors``

number of qualified selectors (e.g. header#nav, .foo#bar, h1.title) (number, with offenders)

##### ``cssRedundantBodySelectors``

number of redundant body selectors (e.g. body .foo, section body h2, but not body > h1) (number, with offenders)

##### ``cssRules``

number of rules (e.g. .foo, .bar { color: red } is counted as one rule) (number, with offenders)

##### ``cssSelectorLengthAvg``

average length of selector (e.g. for ``.foo .bar, #test div > span { color: red }`` will be set as 2.5) (number, with offenders)

##### ``cssSelectors``

number of selectors (e.g. .foo, .bar { color: red } is counted as two selectors - .foo and .bar) (number, with offenders)

##### ``cssSelectorsByAttribute``

number of selectors by attribute (e.g. .foo[value=bar]) (number)

##### ``cssSelectorsByClass``

number of selectors by class (number)

##### ``cssSelectorsById``

number of selectors by ID (number)

##### ``cssSelectorsByPseudo``

number of pseudo-selectors (e,g. :hover) (number)

##### ``cssSelectorsByTag``

number of selectors by tag name (number)

##### ``cssSpecificityClassAvg``

average specificity for class, pseudo-class or attribute (number, with offenders)

##### ``cssSpecificityClassTotal``

total specificity for class, pseudo-class or attribute (number)

##### ``cssSpecificityIdAvg``

average specificity for ID (number, with offenders)

##### ``cssSpecificityIdTotal``

total specificity for ID (number)

##### ``cssSpecificityTagAvg``

average specificity for element (number, with offenders)

##### ``cssSpecificityTagTotal``

total specificity for element (number)

##### ``redundantChildNodesSelectors``

number of redundant child nodes selectors (number, with offenders)

## [assetsTypes](https://github.com/macbre/phantomas/tree/devel/modules/assetsTypes/assetsTypes.js)

> Analyzes number of requests and sizes of different types of assets

##### ``base64Count``

number of base64 encoded "responses" (no HTTP request was actually made) (number, with offenders)

##### ``base64Size``

size of base64 encoded responses (bytes)

##### ``cssCount``

number of CSS responses (number, with offenders)

##### ``cssSize``

size of CSS responses (with compression) (bytes)

##### ``htmlCount``

number of HTML responses (number, with offenders)

##### ``htmlSize``

size of HTML responses (with compression) (bytes)

##### ``imageCount``

number of image responses (number, with offenders)

##### ``imageSize``

size of image responses (with compression) (bytes)

##### ``jsCount``

number of JS responses (number, with offenders)

##### ``jsSize``

size of JS responses (with compression) (bytes)

##### ``jsonCount``

number of JSON responses (number, with offenders)

##### ``jsonSize``

size of JSON responses (with compression) (bytes)

##### ``otherCount``

number of other responses (number, with offenders)

##### ``otherSize``

size of other responses (with compression) (bytes)

##### ``videoCount``

number of video responses (number, with offenders)

##### ``videoSize``

size of video responses (with compression) (bytes)

##### ``webfontCount``

number of web font responses (number, with offenders)

##### ``webfontSize``

size of web font responses (with compression) (bytes)

## [blockDomains](https://github.com/macbre/phantomas/tree/devel/modules/blockDomains/blockDomains.js)

> Aborts requests to external resources or given domains
Does not emit any metrics

##### ``blockedRequests``

number of requests blocked due to domain filtering (number, with offenders)

## [cacheHits](https://github.com/macbre/phantomas/tree/devel/modules/cacheHits/cacheHits.js)

> Analyzes Age and X-Cache headers from caching servers like Squid or Varnish

##### ``cacheHits``

number of cache hits (number, with offenders)

##### ``cacheMisses``

number of cache misses (number, with offenders)

##### ``cachePasses``

number of cache passes (number, with offenders)

## [caching](https://github.com/macbre/phantomas/tree/devel/modules/caching/caching.js)

> Analyzes HTTP caching headers

##### ``cachingDisabled``

number of responses with caching disabled (max-age=0) (number, with offenders)

##### ``cachingNotSpecified``

number of responses with no caching header sent (no Cache-Control header) (number, with offenders)

##### ``cachingTooShort``

number of responses with too short (less than a week) caching time (number, with offenders)

##### ``cachingUseImmutable``

number of responses with a long TTL that can benefit from Cache-Control: immutable (number, with offenders)

##### ``oldCachingHeaders``

number of responses with old, HTTP 1.0 caching headers (Expires and Pragma) (number, with offenders)

## [console](https://github.com/macbre/phantomas/tree/devel/modules/console/console.js)

> Meters number of console logs

##### ``consoleMessages``

number of calls to console.* functions (number, with offenders)

## [cookies](https://github.com/macbre/phantomas/tree/devel/modules/cookies/cookies.js)

> cookies metrics

##### ``cookiesRecv``

length of cookies received in HTTP responses (bytes)

##### ``cookiesSent``

length of cookies sent in HTTP requests (bytes)

##### ``documentCookiesCount``

number of cookies in document.cookie (number)

##### ``documentCookiesLength``

length of document.cookie (bytes)

##### ``domainsWithCookies``

number of domains with cookies set (number, with offenders)

## [documentHeight](https://github.com/macbre/phantomas/tree/devel/modules/documentHeight/documentHeight.js)

> Measure document height

##### ``documentHeight``

the page height (px)

## [domComplexity](https://github.com/macbre/phantomas/tree/devel/modules/domComplexity/domComplexity.js)

> Analyzes DOM complexity

##### ``DOMelementMaxDepth``

maximum level on nesting of HTML element node (number, with offenders)

##### ``DOMelementsCount``

total number of HTML element nodes (number)

##### ``DOMidDuplicated``

number of duplicated IDs found in DOM (number, with offenders)

##### ``bodyHTMLSize``

the size of body tag content (document.body.innerHTML.length) (bytes)

##### ``commentsSize``

the size of HTML comments on the page (bytes, with offenders)

##### ``iframesCount``

number of iframe nodes (number, with offenders)

##### ``imagesScaledDown``

number of <img> nodes that have images scaled down in HTML (number, with offenders)

##### ``imagesWithoutDimensions``

number of <img> nodes without both width and height attribute (number, with offenders)

##### ``nodesWithInlineCSS``

number of nodes with inline CSS styling (with style attribute) (number, with offenders)

##### ``whiteSpacesSize``

the size of text nodes with whitespaces only (bytes)

## [domHiddenContent](https://github.com/macbre/phantomas/tree/devel/modules/domHiddenContent/domHiddenContent.js)

> Analyzes DOM hidden content

##### ``hiddenContentSize``

the size of content of hidden elements on the page (with CSS display: none) (bytes, with offenders)

##### ``hiddenImages``

number of hidden images that can be lazy-loaded (number, with offenders)

## [domMutations](https://github.com/macbre/phantomas/tree/devel/modules/domMutations/domMutations.js)

> Analyzes DOM changes via MutationObserver API

##### ``DOMmutationsAttributes``

number of DOM nodes attributes changes (number, with offenders)

##### ``DOMmutationsInserts``

number of <body> node inserts (number, with offenders)

##### ``DOMmutationsRemoves``

number of <body> node removes (number, with offenders)

## [domQueries](https://github.com/macbre/phantomas/tree/devel/modules/domQueries/domQueries.js)

> Analyzes DOM queries done via native DOM methods

##### ``DOMinserts``

number of DOM nodes inserts (number, with offenders)

##### ``DOMqueries``

number of all DOM queries (number, with offenders)

##### ``DOMqueriesAvoidable``

number of repeated uses of a duplicated query (number)

##### ``DOMqueriesByClassName``

number of document.getElementsByClassName calls (number, with offenders)

##### ``DOMqueriesById``

number of document.getElementById calls (number, with offenders)

##### ``DOMqueriesByQuerySelectorAll``

number of document.querySelector(All) calls (number, with offenders)

##### ``DOMqueriesByTagName``

number of document.getElementsByTagName calls (number, with offenders)

##### ``DOMqueriesDuplicated``

number of DOM queries called more than once (number, with offenders)

##### ``DOMqueriesWithoutResults``

number of DOM queries that returned nothing (number, with offenders)

## [domains](https://github.com/macbre/phantomas/tree/devel/modules/domains/domains.js)

> Domains monitor

##### ``domains``

number of domains used to fetch the page (number, with offenders)

##### ``maxRequestsPerDomain``

maximum number of requests fetched from a single domain (number)

##### ``medianRequestsPerDomain``

median of number of requests fetched from each domain (number)

## [events](https://github.com/macbre/phantomas/tree/devel/modules/events/events.js)

> Analyzes events bound to DOM elements

##### ``eventsBound``

number of EventTarget.addEventListener calls (number, with offenders)

##### ``eventsDispatched``

number of EventTarget.dispatchEvent calls (number, with offenders)

##### ``eventsScrollBound``

number of scroll event bounds (number, with offenders)

## [globalVariables](https://github.com/macbre/phantomas/tree/devel/modules/globalVariables/globalVariables.js)

> Counts global JavaScript variables

##### ``globalVariables``

number of JS globals variables (number, with offenders)

##### ``globalVariablesFalsy``

number of JS globals variables with falsy value (number, with offenders)

## [headers](https://github.com/macbre/phantomas/tree/devel/modules/headers/headers.js)

> Analyzes HTTP headers in both requests and responses

##### ``headersBiggerThanContent``

number of responses with headers part bigger than the response body (number, with offenders)

##### ``headersCount``

number of requests and responses headers (number)

##### ``headersRecvCount``

number of headers received in responses (number)

##### ``headersRecvSize``

size of received headers (bytes)

##### ``headersSentCount``

number of headers sent in requests (number)

##### ``headersSentSize``

size of sent headers (bytes)

##### ``headersSize``

size of all headers (bytes)

## [jQuery](https://github.com/macbre/phantomas/tree/devel/modules/jQuery/jQuery.js)

> Analyzes jQuery activity

##### ``jQueryDOMReads``

number of DOM read operations (number, with offenders)

##### ``jQueryDOMWriteReadSwitches``

number of read operations that follow a series of write operations (will cause repaint and can cause reflow) (number, with offenders)

##### ``jQueryDOMWrites``

number of DOM write operations (number, with offenders)

##### ``jQueryEventTriggers``

number of jQuery event triggers (number, with offenders)

##### ``jQueryOnDOMReadyFunctions``

number of functions bound to onDOMReady event (number, with offenders)

##### ``jQuerySizzleCalls``

number of calls to Sizzle (including those that will be resolved using querySelectorAll) (number, with offenders)

##### ``jQueryVersion``

version of jQuery framework (if loaded) (string)

##### ``jQueryVersionsLoaded``

number of loaded jQuery "instances" (even in the same version) (number, with offenders)

##### ``jQueryWindowOnLoadFunctions``

number of functions bound to windowOnLoad event (number, with offenders)

## [javaScriptBottlenecks](https://github.com/macbre/phantomas/tree/devel/modules/javaScriptBottlenecks/javaScriptBottlenecks.js)

> Reports the use of functions known to be serious performance bottlenecks in JS

Run phantomas with --spy-eval to count eval() calls (see issue #467)

##### ``documentWriteCalls``

number of calls to either document.write or document.writeln (number, with offenders)

##### ``evalCalls``

number of calls to eval (either direct or via setTimeout / setInterval) (number, with offenders)

## [jserrors](https://github.com/macbre/phantomas/tree/devel/modules/jserrors/jserrors.js)

> Meters the number of page errors, and provides traces as offenders for "jsErrors" metric

##### ``jsErrors``

number of JavaScript errors (number, with offenders)

## [keepAlive](https://github.com/macbre/phantomas/tree/devel/modules/keepAlive/keepAlive.js)

> Analyzes if HTTP responses keep the connections alive.

##### ``closedConnections``

number of requests not keeping the connection alive and slowing down the next request (number, with offenders)

## [lazyLoadableImages](https://github.com/macbre/phantomas/tree/devel/modules/lazyLoadableImages/lazyLoadableImages.js)

> Analyzes images and detects which one can be lazy-loaded (are below the fold)

##### ``lazyLoadableImagesBelowTheFold``

number of images displayed below the fold that can be lazy-loaded (number, with offenders)

## [localStorage](https://github.com/macbre/phantomas/tree/devel/modules/localStorage/localStorage.js)

> localStorage metrics

##### ``localStorageEntries``

number of entries in local storage (number, with offenders)

## [mainRequest](https://github.com/macbre/phantomas/tree/devel/modules/mainRequest/mainRequest.js)

> Analyzes bits of data pertaining to the main request only

##### ``statusCodesTrail``

comma-separated list of HTTP status codes that main request followed through (could contain a single element if the main request is a terminal one) (string)

## [navigationTiming](https://github.com/macbre/phantomas/tree/devel/core/modules/navigationTiming/navigationTiming.js)

> Emits "milestone" event on Navigation Timing related events:
- domContentLoaded
- domInteractive
- domComplete
Code taken from windowPerformance module

## [redirects](https://github.com/macbre/phantomas/tree/devel/modules/redirects/redirects.js)

> Analyzes HTTP redirects

##### ``redirects``

number of HTTP redirects (either 301, 302 or 303) (number, with offenders)

##### ``redirectsTime``

time it took to send and receive redirects (ms)

## [requestsMonitor](https://github.com/macbre/phantomas/tree/devel/core/modules/requestsMonitor/requestsMonitor.js)

> Simple HTTP requests monitor and analyzer

##### ``bodySize``

size of the uncompressed content of all responses (bytes)

##### ``contentLength``

size of the compressed content of all responses, i.e. what was transfered in packets (bytes)

##### ``gzipRequests``

number of gzipped HTTP responses (number, with offenders)

##### ``httpTrafficCompleted``

time it took to receive the last byte of the last HTTP response (ms)

##### ``httpsRequests``

number of HTTPS requests (number, with offenders)

##### ``notFound``

number of HTTP 404 responses (number, with offenders)

##### ``postRequests``

number of POST requests (number, with offenders)

##### ``requests``

total number of HTTP requests made (number, with offenders)

## [requestsStats](https://github.com/macbre/phantomas/tree/devel/modules/requestsStats/requestsStats.js)

> Analyzes HTTP requests and generates stats metrics

##### ``biggestLatency``

the time to the first byte of the slowest response (ms, with offenders)

##### ``biggestResponse``

the size of the biggest response (bytes, with offenders)

##### ``fastestResponse``

the time to the last byte of the fastest response (ms, with offenders)

##### ``medianLatency``

median value of time to the first byte for all responses (ms, with offenders)

##### ``medianResponse``

median value of time to the last byte for all responses (ms, with offenders)

##### ``slowestResponse``

the time to the last byte of the slowest response (ms, with offenders)

##### ``smallestLatency``

the time to the first byte of the fastest response (ms, with offenders)

##### ``smallestResponse``

the size of the smallest response (bytes, with offenders)

## [requestsTo](https://github.com/macbre/phantomas/tree/devel/modules/requestsTo/requestsTo.js)

> Number of requests it took to make the page enter DomContentLoaded and DomComplete states accordingly

##### ``domainsToDomComplete``

number of domains used to make the page reach DomComplete state (number, with offenders)

##### ``domainsToDomContentLoaded``

number of domains used to make the page reach DomContentLoaded state (number, with offenders)

##### ``domainsToFirstPaint``

number of domains used to make the first paint (number, with offenders)

##### ``requestsToDomComplete``

number of HTTP requests it took to make the page reach DomComplete state (number)

##### ``requestsToDomContentLoaded``

number of HTTP requests it took to make the page reach DomContentLoaded state (number)

##### ``requestsToFirstPaint``

number of HTTP requests it took to make the first paint (number)

## [staticAssets](https://github.com/macbre/phantomas/tree/devel/modules/staticAssets/staticAssets.js)

> Analyzes static assets (CSS, JS and images)

##### ``assetsNotGzipped``

number of static assets that were not gzipped (number, with offenders)

##### ``assetsWithCookies``

number of static assets requested from domains with cookie set (number, with offenders)

##### ``assetsWithQueryString``

number of static assets requested with query string (e.g. ?foo) in URL (number, with offenders)

##### ``multipleRequests``

number of static assets that are requested more than once (number, with offenders)

##### ``smallCssFiles``

number of CSS assets smaller than 2 KiB that can be inlined or merged (number, with offenders)

##### ``smallImages``

number of images smaller than 2 KiB that can be base64 encoded (number, with offenders)

##### ``smallJsFiles``

number of JS assets smaller than 2 KiB that can be inlined or merged (number, with offenders)

## [timeToFirst](https://github.com/macbre/phantomas/tree/devel/modules/timeToFirst/timeToFirst.js)

> Provides metrics for time to first image, CSS and JS file

##### ``timeToFirstCss``

time it took to receive the last byte of the first CSS (ms, with offenders)

##### ``timeToFirstImage``

time it took to receive the last byte of the first image (ms, with offenders)

##### ``timeToFirstJs``

time it took to receive the last byte of the first JS (ms, with offenders)

## [timeToFirstByte](https://github.com/macbre/phantomas/tree/devel/core/modules/timeToFirstByte/timeToFirstByte.js)

> Takes a look at "time to first (last) byte" metrics

##### ``timeToFirstByte``

time it took to receive the first byte of the first response (that was not a redirect) (ms)

##### ``timeToLastByte``

time it took to receive the last byte of the first response (that was not a redirect) (ms)

## [windowPerformance](https://github.com/macbre/phantomas/tree/devel/modules/windowPerformance/windowPerformance.js)

> Measure when the page reaches certain states

##### ``domComplete``

time it took to load all page resources, the loading spinner has stopped spinning (ms)

##### ``domContentLoaded``

time it took to construct both DOM and CSSOM, no stylesheets that are blocking JavaScript execution (i.e. onDOMReady) (ms)

##### ``domContentLoadedEnd``

time it took to finish handling of onDOMReady event (ms)

##### ``domInteractive``

time it took to parse the HTML and construct the DOM (ms)

##### ``timeBackend``

time to the first byte compared to the total loading time (%)

##### ``timeFrontend``

time to window.load compared to the total loading time (%)

---
> This file is auto-generated from code comments. Please run `npm run make-docs` to update it.