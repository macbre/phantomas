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
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.5790.98 Safari/537.36 Phantomas/2.9.0"
    },
    "mixedContentType": "none",
    "initialPriority": "VeryHigh",
    "referrerPolicy": "strict-origin-when-cross-origin",
    "isSameSite": true,
    "_requestId": "AB54BDDE82405E50795287A956C56D85",
    "_timestamp": 1054644.425833,
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
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.5790.98 Safari/537.36 Phantomas/2.9.0"
    },
    "mixedContentType": "none",
    "initialPriority": "VeryHigh",
    "referrerPolicy": "strict-origin-when-cross-origin",
    "isSameSite": true,
    "_requestId": "AB54BDDE82405E50795287A956C56D85",
    "_timestamp": 1054644.425833,
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
      "Date": "Tue, 15 Aug 2023 12:28:56 GMT",
      "ETag": "W/\"64ac142c-30f\"",
      "Expires": "Wed, 16 Aug 2023 12:28:56 GMT",
      "Last-Modified": "Mon, 10 Jul 2023 14:22:36 GMT",
      "Server": "nginx",
      "Transfer-Encoding": "chunked"
    },
    "mimeType": "text/html",
    "connectionReused": true,
    "connectionId": 37,
    "remoteIPAddress": "0.0.0.0",
    "remotePort": 8888,
    "fromDiskCache": false,
    "fromServiceWorker": false,
    "fromPrefetchCache": false,
    "encodedDataLength": 720,
    "timing": {
      "requestTime": 1054644.429149,
      "proxyStart": -1,
      "proxyEnd": -1,
      "dnsStart": -1,
      "dnsEnd": -1,
      "connectStart": -1,
      "connectEnd": -1,
      "sslStart": -1,
      "sslEnd": -1,
      "workerStart": -1,
      "workerReady": -1,
      "workerFetchStart": -1,
      "workerRespondWithSettled": -1,
      "sendStart": 1.851,
      "sendEnd": 1.881,
      "pushStart": 0,
      "pushEnd": 0,
      "receiveHeadersEnd": 19.973
    },
    "responseTime": 1692102536904.425,
    "protocol": "http/1.1",
    "alternateProtocolUsage": "unspecifiedReason",
    "securityState": "insecure",
    "_requestId": "AB54BDDE82405E50795287A956C56D85",
    "dataLength": 783,
    "chunks": 1,
    "_timestamp": 1054644.449299
  }
]
```

### recv

Arguments passed to the event:

```json
[
  {
    "id": "AB54BDDE82405E50795287A956C56D85",
    "url": "http://0.0.0.0:8888/_make_docs.html",
    "method": "GET",
    "headers": {
      "cache-control": "max-age=86400",
      "connection": "keep-alive",
      "content-encoding": "gzip",
      "content-type": "text/html",
      "date": "Tue, 15 Aug 2023 12:28:56 GMT",
      "etag": "W/\"64ac142c-30f\"",
      "expires": "Wed, 16 Aug 2023 12:28:56 GMT",
      "last-modified": "Mon, 10 Jul 2023 14:22:36 GMT",
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
    "stalled": 1.851,
    "timeToFirstByte": 18.092,
    "timeToLastByte": 0.023465999867767096,
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
      "Date": "Tue, 15 Aug 2023 12:28:56 GMT",
      "ETag": "W/\"64ac142c-30f\"",
      "Expires": "Wed, 16 Aug 2023 12:28:56 GMT",
      "Last-Modified": "Mon, 10 Jul 2023 14:22:36 GMT",
      "Server": "nginx",
      "Transfer-Encoding": "chunked"
    },
    "mimeType": "text/html",
    "connectionReused": true,
    "connectionId": 37,
    "remoteIPAddress": "0.0.0.0",
    "remotePort": 8888,
    "fromDiskCache": false,
    "fromServiceWorker": false,
    "fromPrefetchCache": false,
    "encodedDataLength": 720,
    "timing": {
      "requestTime": 1054644.429149,
      "proxyStart": -1,
      "proxyEnd": -1,
      "dnsStart": -1,
      "dnsEnd": -1,
      "connectStart": -1,
      "connectEnd": -1,
      "sslStart": -1,
      "sslEnd": -1,
      "workerStart": -1,
      "workerReady": -1,
      "workerFetchStart": -1,
      "workerRespondWithSettled": -1,
      "sendStart": 1.851,
      "sendEnd": 1.881,
      "pushStart": 0,
      "pushEnd": 0,
      "receiveHeadersEnd": 19.973
    },
    "responseTime": 1692102536904.425,
    "protocol": "http/1.1",
    "alternateProtocolUsage": "unspecifiedReason",
    "securityState": "insecure",
    "_requestId": "AB54BDDE82405E50795287A956C56D85",
    "dataLength": 783,
    "chunks": 1,
    "_timestamp": 1054644.449299
  }
]
```

### consoleLog

Arguments passed to the event:

```json
[
  {}
]
```

### jserror

Arguments passed to the event:

```json
[
  "unknown_function_called is not defined",
  []
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
    "Timestamp": 1054644.632499,
    "Documents": 3,
    "Frames": 1,
    "JSEventListeners": 23,
    "Nodes": 207,
    "LayoutCount": 14,
    "RecalcStyleCount": 15,
    "LayoutDuration": 0.009906,
    "RecalcStyleDuration": 0.001265,
    "ScriptDuration": 0.041899,
    "TaskDuration": 0.095868,
    "JSHeapUsedSize": 4212528,
    "JSHeapTotalSize": 6176768
  }
]
```

---
> This file is auto-generated from code comments. Please run `npm run make-docs` to update it.