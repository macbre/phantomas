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

**Arguments**: page, browser.getPuppeteerBrowser(

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
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4950.0 Safari/537.36 Phantomas/2.4.0"
    },
    "mixedContentType": "none",
    "initialPriority": "VeryHigh",
    "referrerPolicy": "strict-origin-when-cross-origin",
    "isSameSite": true,
    "_requestId": "7EB9712AA9EB3011BC4F4F792F24758D",
    "_timestamp": 233671.373283,
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
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4950.0 Safari/537.36 Phantomas/2.4.0"
    },
    "mixedContentType": "none",
    "initialPriority": "VeryHigh",
    "referrerPolicy": "strict-origin-when-cross-origin",
    "isSameSite": true,
    "_requestId": "7EB9712AA9EB3011BC4F4F792F24758D",
    "_timestamp": 233671.373283,
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
      "Cache-Control": "max-age=86400",
      "Connection": "keep-alive",
      "Content-Encoding": "gzip",
      "Content-Type": "text/html",
      "Date": "Wed, 04 May 2022 22:02:04 GMT",
      "ETag": "W/\"60ae63c4-30f\"",
      "Expires": "Thu, 05 May 2022 22:02:04 GMT",
      "Last-Modified": "Wed, 26 May 2021 15:05:40 GMT",
      "Server": "nginx",
      "Transfer-Encoding": "chunked"
    },
    "mimeType": "text/html",
    "connectionReused": false,
    "connectionId": 11,
    "remoteIPAddress": "0.0.0.0",
    "remotePort": 8888,
    "fromDiskCache": false,
    "fromServiceWorker": false,
    "fromPrefetchCache": false,
    "encodedDataLength": 720,
    "timing": {
      "requestTime": 233671.37754,
      "proxyStart": -1,
      "proxyEnd": -1,
      "dnsStart": 13.281,
      "dnsEnd": 13.289,
      "connectStart": 13.289,
      "connectEnd": 13.453,
      "sslStart": -1,
      "sslEnd": -1,
      "workerStart": -1,
      "workerReady": -1,
      "workerFetchStart": -1,
      "workerRespondWithSettled": -1,
      "sendStart": 14.703,
      "sendEnd": 15.226,
      "pushStart": 0,
      "pushEnd": 0,
      "receiveHeadersEnd": 24.219
    },
    "responseTime": 1651701724644.302,
    "protocol": "http/1.1",
    "securityState": "insecure",
    "_requestId": "7EB9712AA9EB3011BC4F4F792F24758D",
    "dataLength": 783,
    "chunks": 1,
    "_timestamp": 233671.403456
  }
]
```

### recv

Arguments passed to the event:

```json
[
  {
    "id": "7EB9712AA9EB3011BC4F4F792F24758D",
    "url": "http://0.0.0.0:8888/_make_docs.html",
    "method": "GET",
    "headers": {
      "cache-control": "max-age=86400",
      "connection": "keep-alive",
      "content-encoding": "gzip",
      "content-type": "text/html",
      "date": "Wed, 04 May 2022 22:02:04 GMT",
      "etag": "W/\"60ae63c4-30f\"",
      "expires": "Thu, 05 May 2022 22:02:04 GMT",
      "last-modified": "Wed, 26 May 2021 15:05:40 GMT",
      "server": "nginx",
      "transfer-encoding": "chunked"
    },
    "bodySize": 783,
    "transferedSize": 720,
    "responseSize": 720,
    "type": "html",
    "protocol": "http",
    "domain": "0.0.0.0",
    "query": "",
    "stalled": 14.703,
    "timeToFirstByte": 8.993,
    "timeToLastByte": 0.03017300000647083,
    "headersSize": 293,
    "gzip": true,
    "contentType": "text/html",
    "isHTML": true,
    "status": 200,
    "statusText": "OK",
    "httpVersion": "http/1.1"
  },
  {
    "url": "http://0.0.0.0:8888/_make_docs.html",
    "status": 200,
    "statusText": "OK",
    "headers": {
      "Cache-Control": "max-age=86400",
      "Connection": "keep-alive",
      "Content-Encoding": "gzip",
      "Content-Type": "text/html",
      "Date": "Wed, 04 May 2022 22:02:04 GMT",
      "ETag": "W/\"60ae63c4-30f\"",
      "Expires": "Thu, 05 May 2022 22:02:04 GMT",
      "Last-Modified": "Wed, 26 May 2021 15:05:40 GMT",
      "Server": "nginx",
      "Transfer-Encoding": "chunked"
    },
    "mimeType": "text/html",
    "connectionReused": false,
    "connectionId": 11,
    "remoteIPAddress": "0.0.0.0",
    "remotePort": 8888,
    "fromDiskCache": false,
    "fromServiceWorker": false,
    "fromPrefetchCache": false,
    "encodedDataLength": 720,
    "timing": {
      "requestTime": 233671.37754,
      "proxyStart": -1,
      "proxyEnd": -1,
      "dnsStart": 13.281,
      "dnsEnd": 13.289,
      "connectStart": 13.289,
      "connectEnd": 13.453,
      "sslStart": -1,
      "sslEnd": -1,
      "workerStart": -1,
      "workerReady": -1,
      "workerFetchStart": -1,
      "workerRespondWithSettled": -1,
      "sendStart": 14.703,
      "sendEnd": 15.226,
      "pushStart": 0,
      "pushEnd": 0,
      "receiveHeadersEnd": 24.219
    },
    "responseTime": 1651701724644.302,
    "protocol": "http/1.1",
    "securityState": "insecure",
    "_requestId": "7EB9712AA9EB3011BC4F4F792F24758D",
    "dataLength": 783,
    "chunks": 1,
    "_timestamp": 233671.403456
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
    "_stackTraceLocations": [
      {
        "url": "http://0.0.0.0:8888/static/foo.min.js"
      }
    ]
  }
]
```

### jserror

Arguments passed to the event:

```json
[
  "ReferenceError: unknown_function_called is not defined",
  [
    "    at http://0.0.0.0:8888/_make_docs.html:31:3"
  ]
]
```

### milestone

Arguments passed to the event:

```json
[
  "domInteractive"
]
```

### metrics

Arguments passed to the event:

```json
[
  {
    "Timestamp": 233671.751763,
    "Documents": 3,
    "Frames": 1,
    "JSEventListeners": 22,
    "Nodes": 210,
    "LayoutCount": 13,
    "RecalcStyleCount": 15,
    "LayoutDuration": 0.017863,
    "RecalcStyleDuration": 0.004322,
    "ScriptDuration": 0.074783,
    "TaskDuration": 0.190317,
    "JSHeapUsedSize": 4006772,
    "JSHeapTotalSize": 5857280
  }
]
```

---
> This file is auto-generated from code comments. Please run `npm run make-docs` to update it.