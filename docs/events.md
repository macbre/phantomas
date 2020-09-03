Events
======

### base64recv

**Description**: base64-encoded "response" has been received

**Arguments**: entry, resp

[View source](https://github.com/macbre/phantomas/tree/devel/core/modules/requestsMonitor/requestsMonitor.js)


### beforeClose

**Description**: Called before the Chromium (and all of its pages) is closed

**Arguments**: page

[View source](https://github.com/macbre/phantomas/tree/devel/lib/index.js)


### consoleLog

**Description**: `console.log` has been called in page's scope

**Arguments**: msg

[View source](https://github.com/macbre/phantomas/tree/devel/lib/browser.js)


### domQuery

**Description**: DOM query has been made

**Arguments**: type, query, fnName, context, hasNoResults

[View source](https://github.com/macbre/phantomas/tree/devel/modules/domQueries/scope.js)


### init

**Description**: Browser's scope and modules are set up, the page is about to be loaded

**Arguments**: page, browser

[View source](https://github.com/macbre/phantomas/tree/devel/lib/index.js)


### jserror

**Description**: Emitted when an uncaught exception happens within the page

**Arguments**: message, trace

[View source](https://github.com/macbre/phantomas/tree/devel/lib/browser.js)


### loaded

**Description**: Emitted when the page has been fully loaded

**Arguments**: this.page

[View source](https://github.com/macbre/phantomas/tree/devel/lib/browser.js)


### metrics

**Description**: Emitted when Chromuim's page.metrics() has been called

**Arguments**: metrics

[View source](https://github.com/macbre/phantomas/tree/devel/lib/browser.js)


### milestone

**Description**: Page loading milestone has been reached: domInteractive, domReady and domComplete

**Arguments**: eventName

[View source](https://github.com/macbre/phantomas/tree/devel/core/modules/navigationTiming/scope.js)


### recv

**Description**: response has been received

**Arguments**: entry, resp

[View source](https://github.com/macbre/phantomas/tree/devel/core/modules/requestsMonitor/requestsMonitor.js)


### request

**Description**: Emitted when page is about to send HTTP request

**Arguments**: request

[View source](https://github.com/macbre/phantomas/tree/devel/lib/browser.js)


### response

**Description**: Emitted when page received a HTTP response

**Arguments**: response

[View source](https://github.com/macbre/phantomas/tree/devel/lib/browser.js)


### responseEnd

**Description**: The first response (that was not a redirect) fully received

**Arguments**: entry, res

[View source](https://github.com/macbre/phantomas/tree/devel/core/modules/timeToFirstByte/timeToFirstByte.js)


### send

**Description**: request has been sent

**Arguments**: request

[View source](https://github.com/macbre/phantomas/tree/devel/core/modules/requestsMonitor/requestsMonitor.js)


## Examples

### request

Arguments passed to the event:

```json
[
  {
    "url": "http://0.0.0.0:8888/_make_docs.html",
    "method": "GET",
    "headers": {
      "Upgrade-Insecure-Requests": "1",
      "User-Agent": "phantomas/2.0.0-alpha2 (HeadlessChrome/85.0.4182.0)"
    },
    "mixedContentType": "none",
    "initialPriority": "VeryHigh",
    "referrerPolicy": "no-referrer-when-downgrade",
    "_requestId": "44313333F946E2485EF4C77910721BEA",
    "_timestamp": 36942.597286,
    "_type": "Document",
    "_initiator": {
      "type": "other"
    }
  }
]
```

### send

Arguments passed to the event:

```json
[
  {
    "url": "http://0.0.0.0:8888/_make_docs.html",
    "method": "GET",
    "headers": {
      "Upgrade-Insecure-Requests": "1",
      "User-Agent": "phantomas/2.0.0-alpha2 (HeadlessChrome/85.0.4182.0)"
    },
    "mixedContentType": "none",
    "initialPriority": "VeryHigh",
    "referrerPolicy": "no-referrer-when-downgrade",
    "_requestId": "44313333F946E2485EF4C77910721BEA",
    "_timestamp": 36942.597286,
    "_type": "Document",
    "_initiator": {
      "type": "other"
    }
  }
]
```

### response

Arguments passed to the event:

```json
[
  {
    "url": "http://0.0.0.0:8888/_make_docs.html",
    "status": 200,
    "statusText": "OK",
    "headers": {
      "Server": "nginx",
      "Date": "Thu, 03 Sep 2020 18:54:24 GMT",
      "Content-Type": "text/html",
      "Last-Modified": "Thu, 03 Sep 2020 18:54:21 GMT",
      "Transfer-Encoding": "chunked",
      "Connection": "keep-alive",
      "ETag": "W/\"5f513bdd-2b0\"",
      "Expires": "Fri, 04 Sep 2020 18:54:24 GMT",
      "Cache-Control": "max-age=86400",
      "Content-Encoding": "gzip"
    },
    "headersText": "HTTP/1.1 200 OK\r\nServer: nginx\r\nDate: Thu, 03 Sep 2020 18:54:24 GMT\r\nContent-Type: text/html\r\nLast-Modified: Thu, 03 Sep 2020 18:54:21 GMT\r\nTransfer-Encoding: chunked\r\nConnection: keep-alive\r\nETag: W/\"5f513bdd-2b0\"\r\nExpires: Fri, 04 Sep 2020 18:54:24 GMT\r\nCache-Control: max-age=86400\r\nContent-Encoding: gzip\r\n\r\n",
    "mimeType": "text/html",
    "requestHeaders": {
      "Host": "0.0.0.0:8888",
      "Connection": "keep-alive",
      "Pragma": "no-cache",
      "Cache-Control": "no-cache",
      "Upgrade-Insecure-Requests": "1",
      "User-Agent": "phantomas/2.0.0-alpha2 (HeadlessChrome/85.0.4182.0)",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
      "Accept-Encoding": "gzip, deflate",
      "Accept-Language": "pl"
    },
    "requestHeadersText": "GET /_make_docs.html HTTP/1.1\r\nHost: 0.0.0.0:8888\r\nConnection: keep-alive\r\nPragma: no-cache\r\nCache-Control: no-cache\r\nUpgrade-Insecure-Requests: 1\r\nUser-Agent: phantomas/2.0.0-alpha2 (HeadlessChrome/85.0.4182.0)\r\nAccept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9\r\nAccept-Encoding: gzip, deflate\r\nAccept-Language: pl\r\n",
    "connectionReused": false,
    "connectionId": 12,
    "remoteIPAddress": "0.0.0.0",
    "remotePort": 8888,
    "fromDiskCache": false,
    "fromServiceWorker": false,
    "fromPrefetchCache": false,
    "encodedDataLength": 656,
    "timing": {
      "requestTime": 36942.622307,
      "proxyStart": -1,
      "proxyEnd": -1,
      "dnsStart": 1.15,
      "dnsEnd": 1.164,
      "connectStart": 1.164,
      "connectEnd": 1.439,
      "sslStart": -1,
      "sslEnd": -1,
      "workerStart": -1,
      "workerReady": -1,
      "workerFetchStart": -1,
      "workerRespondWithSettled": -1,
      "sendStart": 1.576,
      "sendEnd": 1.687,
      "pushStart": 0,
      "pushEnd": 0,
      "receiveHeadersEnd": 2.433
    },
    "responseTime": 1599159264422.292,
    "protocol": "http/1.1",
    "securityState": "insecure",
    "_requestId": "44313333F946E2485EF4C77910721BEA",
    "dataLength": 688,
    "chunks": 1,
    "_timestamp": 36942.625934
  }
]
```

### recv

Arguments passed to the event:

```json
[
  {
    "id": "44313333F946E2485EF4C77910721BEA",
    "url": "http://0.0.0.0:8888/_make_docs.html",
    "method": "GET",
    "headers": {
      "server": "nginx",
      "date": "Thu, 03 Sep 2020 18:54:24 GMT",
      "content-type": "text/html",
      "last-modified": "Thu, 03 Sep 2020 18:54:21 GMT",
      "transfer-encoding": "chunked",
      "connection": "keep-alive",
      "etag": "W/\"5f513bdd-2b0\"",
      "expires": "Fri, 04 Sep 2020 18:54:24 GMT",
      "cache-control": "max-age=86400",
      "content-encoding": "gzip"
    },
    "bodySize": 688,
    "transferedSize": 656,
    "responseSize": 656,
    "type": "html",
    "protocol": "http",
    "domain": "0.0.0.0",
    "query": null,
    "stalled": 1.576,
    "timeToFirstByte": 0.7459999999999998,
    "timeToLastByte": 0.028648000006796792,
    "headersSize": 293,
    "contentType": "text/html",
    "isHTML": true,
    "gzip": true,
    "status": 200,
    "statusText": "OK"
  },
  {
    "url": "http://0.0.0.0:8888/_make_docs.html",
    "status": 200,
    "statusText": "OK",
    "headers": {
      "Server": "nginx",
      "Date": "Thu, 03 Sep 2020 18:54:24 GMT",
      "Content-Type": "text/html",
      "Last-Modified": "Thu, 03 Sep 2020 18:54:21 GMT",
      "Transfer-Encoding": "chunked",
      "Connection": "keep-alive",
      "ETag": "W/\"5f513bdd-2b0\"",
      "Expires": "Fri, 04 Sep 2020 18:54:24 GMT",
      "Cache-Control": "max-age=86400",
      "Content-Encoding": "gzip"
    },
    "headersText": "HTTP/1.1 200 OK\r\nServer: nginx\r\nDate: Thu, 03 Sep 2020 18:54:24 GMT\r\nContent-Type: text/html\r\nLast-Modified: Thu, 03 Sep 2020 18:54:21 GMT\r\nTransfer-Encoding: chunked\r\nConnection: keep-alive\r\nETag: W/\"5f513bdd-2b0\"\r\nExpires: Fri, 04 Sep 2020 18:54:24 GMT\r\nCache-Control: max-age=86400\r\nContent-Encoding: gzip\r\n\r\n",
    "mimeType": "text/html",
    "requestHeaders": {
      "Host": "0.0.0.0:8888",
      "Connection": "keep-alive",
      "Pragma": "no-cache",
      "Cache-Control": "no-cache",
      "Upgrade-Insecure-Requests": "1",
      "User-Agent": "phantomas/2.0.0-alpha2 (HeadlessChrome/85.0.4182.0)",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
      "Accept-Encoding": "gzip, deflate",
      "Accept-Language": "pl"
    },
    "requestHeadersText": "GET /_make_docs.html HTTP/1.1\r\nHost: 0.0.0.0:8888\r\nConnection: keep-alive\r\nPragma: no-cache\r\nCache-Control: no-cache\r\nUpgrade-Insecure-Requests: 1\r\nUser-Agent: phantomas/2.0.0-alpha2 (HeadlessChrome/85.0.4182.0)\r\nAccept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9\r\nAccept-Encoding: gzip, deflate\r\nAccept-Language: pl\r\n",
    "connectionReused": false,
    "connectionId": 12,
    "remoteIPAddress": "0.0.0.0",
    "remotePort": 8888,
    "fromDiskCache": false,
    "fromServiceWorker": false,
    "fromPrefetchCache": false,
    "encodedDataLength": 656,
    "timing": {
      "requestTime": 36942.622307,
      "proxyStart": -1,
      "proxyEnd": -1,
      "dnsStart": 1.15,
      "dnsEnd": 1.164,
      "connectStart": 1.164,
      "connectEnd": 1.439,
      "sslStart": -1,
      "sslEnd": -1,
      "workerStart": -1,
      "workerReady": -1,
      "workerFetchStart": -1,
      "workerRespondWithSettled": -1,
      "sendStart": 1.576,
      "sendEnd": 1.687,
      "pushStart": 0,
      "pushEnd": 0,
      "receiveHeadersEnd": 2.433
    },
    "responseTime": 1599159264422.292,
    "protocol": "http/1.1",
    "securityState": "insecure",
    "_requestId": "44313333F946E2485EF4C77910721BEA",
    "dataLength": 688,
    "chunks": 1,
    "_timestamp": 36942.625934
  }
]
```

### consoleLog

Arguments passed to the event:

```json
[
  {
    "_type": "error",
    "_text": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "_args": [],
    "_location": {
      "url": "http://0.0.0.0:8888/static/foo.min.js"
    }
  }
]
```

### jserror

Arguments passed to the event:

```json
[
  "ReferenceError: unknown_function_called is not defined",
  [
    "    at http://0.0.0.0:8888/_make_docs.html:25:3"
  ]
]
```

### metrics

Arguments passed to the event:

```json
[
  {
    "Timestamp": 36942.916316,
    "Documents": 3,
    "Frames": 1,
    "JSEventListeners": 22,
    "Nodes": 207,
    "LayoutCount": 13,
    "RecalcStyleCount": 14,
    "LayoutDuration": 0.004754,
    "RecalcStyleDuration": 0.001125,
    "ScriptDuration": 0.058053,
    "TaskDuration": 0.139957,
    "JSHeapUsedSize": 3054448,
    "JSHeapTotalSize": 5652480
  }
]
```

---
> This file is auto-generated from code comments. Please run `npm run make-docs` to update it.