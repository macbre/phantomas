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
    "url": "http://0.0.0.0:8888/lazy-load-scroll.html",
    "method": "GET",
    "headers": {
      "Upgrade-Insecure-Requests": "1",
      "User-Agent": "phantomas/2.0.0-alpha2 (HeadlessChrome/85.0.4182.0)"
    },
    "mixedContentType": "none",
    "initialPriority": "VeryHigh",
    "referrerPolicy": "no-referrer-when-downgrade",
    "_requestId": "4A3268A1B03726D01328E00682A3B76F",
    "_timestamp": 103131.365927,
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
    "url": "http://0.0.0.0:8888/lazy-load-scroll.html",
    "method": "GET",
    "headers": {
      "Upgrade-Insecure-Requests": "1",
      "User-Agent": "phantomas/2.0.0-alpha2 (HeadlessChrome/85.0.4182.0)"
    },
    "mixedContentType": "none",
    "initialPriority": "VeryHigh",
    "referrerPolicy": "no-referrer-when-downgrade",
    "_requestId": "4A3268A1B03726D01328E00682A3B76F",
    "_timestamp": 103131.365927,
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
    "url": "http://0.0.0.0:8888/lazy-load-scroll.html",
    "status": 200,
    "statusText": "OK",
    "headers": {
      "Server": "nginx",
      "Date": "Tue, 01 Sep 2020 15:58:34 GMT",
      "Content-Type": "text/html",
      "Last-Modified": "Tue, 01 Sep 2020 15:31:33 GMT",
      "Transfer-Encoding": "chunked",
      "Connection": "keep-alive",
      "ETag": "W/\"5f4e6955-3d5\"",
      "Expires": "Wed, 02 Sep 2020 15:58:34 GMT",
      "Cache-Control": "max-age=86400",
      "Content-Encoding": "gzip"
    },
    "headersText": "HTTP/1.1 200 OK\r\nServer: nginx\r\nDate: Tue, 01 Sep 2020 15:58:34 GMT\r\nContent-Type: text/html\r\nLast-Modified: Tue, 01 Sep 2020 15:31:33 GMT\r\nTransfer-Encoding: chunked\r\nConnection: keep-alive\r\nETag: W/\"5f4e6955-3d5\"\r\nExpires: Wed, 02 Sep 2020 15:58:34 GMT\r\nCache-Control: max-age=86400\r\nContent-Encoding: gzip\r\n\r\n",
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
      "Accept-Language": "en-US"
    },
    "requestHeadersText": "GET /lazy-load-scroll.html HTTP/1.1\r\nHost: 0.0.0.0:8888\r\nConnection: keep-alive\r\nPragma: no-cache\r\nCache-Control: no-cache\r\nUpgrade-Insecure-Requests: 1\r\nUser-Agent: phantomas/2.0.0-alpha2 (HeadlessChrome/85.0.4182.0)\r\nAccept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9\r\nAccept-Encoding: gzip, deflate\r\nAccept-Language: en-US\r\n",
    "connectionReused": false,
    "connectionId": 12,
    "remoteIPAddress": "0.0.0.0",
    "remotePort": 8888,
    "fromDiskCache": false,
    "fromServiceWorker": false,
    "fromPrefetchCache": false,
    "encodedDataLength": 794,
    "timing": {
      "requestTime": 103131.393545,
      "proxyStart": -1,
      "proxyEnd": -1,
      "dnsStart": 4.867,
      "dnsEnd": 4.891,
      "connectStart": 4.891,
      "connectEnd": 5.116,
      "sslStart": -1,
      "sslEnd": -1,
      "workerStart": -1,
      "workerReady": -1,
      "workerFetchStart": -1,
      "workerRespondWithSettled": -1,
      "sendStart": 5.693,
      "sendEnd": 5.953,
      "pushStart": 0,
      "pushEnd": 0,
      "receiveHeadersEnd": 8.215
    },
    "responseTime": 1598975914099.363,
    "protocol": "http/1.1",
    "securityState": "insecure",
    "_requestId": "4A3268A1B03726D01328E00682A3B76F",
    "dataLength": 981,
    "chunks": 1,
    "_timestamp": 103131.403612
  }
]
```

### recv

Arguments passed to the event:

```json
[
  {
    "id": "4A3268A1B03726D01328E00682A3B76F",
    "url": "http://0.0.0.0:8888/lazy-load-scroll.html",
    "method": "GET",
    "headers": {
      "server": "nginx",
      "date": "Tue, 01 Sep 2020 15:58:34 GMT",
      "content-type": "text/html",
      "last-modified": "Tue, 01 Sep 2020 15:31:33 GMT",
      "transfer-encoding": "chunked",
      "connection": "keep-alive",
      "etag": "W/\"5f4e6955-3d5\"",
      "expires": "Wed, 02 Sep 2020 15:58:34 GMT",
      "cache-control": "max-age=86400",
      "content-encoding": "gzip"
    },
    "bodySize": 981,
    "transferedSize": 794,
    "responseSize": 794,
    "type": "html",
    "protocol": "http",
    "domain": "0.0.0.0",
    "query": null,
    "stalled": 5.693,
    "timeToFirstByte": 2.2619999999999996,
    "timeToLastByte": 0.03768499998841435,
    "headersSize": 293,
    "contentType": "text/html",
    "isHTML": true,
    "gzip": true,
    "status": 200,
    "statusText": "OK"
  },
  {
    "url": "http://0.0.0.0:8888/lazy-load-scroll.html",
    "status": 200,
    "statusText": "OK",
    "headers": {
      "Server": "nginx",
      "Date": "Tue, 01 Sep 2020 15:58:34 GMT",
      "Content-Type": "text/html",
      "Last-Modified": "Tue, 01 Sep 2020 15:31:33 GMT",
      "Transfer-Encoding": "chunked",
      "Connection": "keep-alive",
      "ETag": "W/\"5f4e6955-3d5\"",
      "Expires": "Wed, 02 Sep 2020 15:58:34 GMT",
      "Cache-Control": "max-age=86400",
      "Content-Encoding": "gzip"
    },
    "headersText": "HTTP/1.1 200 OK\r\nServer: nginx\r\nDate: Tue, 01 Sep 2020 15:58:34 GMT\r\nContent-Type: text/html\r\nLast-Modified: Tue, 01 Sep 2020 15:31:33 GMT\r\nTransfer-Encoding: chunked\r\nConnection: keep-alive\r\nETag: W/\"5f4e6955-3d5\"\r\nExpires: Wed, 02 Sep 2020 15:58:34 GMT\r\nCache-Control: max-age=86400\r\nContent-Encoding: gzip\r\n\r\n",
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
      "Accept-Language": "en-US"
    },
    "requestHeadersText": "GET /lazy-load-scroll.html HTTP/1.1\r\nHost: 0.0.0.0:8888\r\nConnection: keep-alive\r\nPragma: no-cache\r\nCache-Control: no-cache\r\nUpgrade-Insecure-Requests: 1\r\nUser-Agent: phantomas/2.0.0-alpha2 (HeadlessChrome/85.0.4182.0)\r\nAccept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9\r\nAccept-Encoding: gzip, deflate\r\nAccept-Language: en-US\r\n",
    "connectionReused": false,
    "connectionId": 12,
    "remoteIPAddress": "0.0.0.0",
    "remotePort": 8888,
    "fromDiskCache": false,
    "fromServiceWorker": false,
    "fromPrefetchCache": false,
    "encodedDataLength": 794,
    "timing": {
      "requestTime": 103131.393545,
      "proxyStart": -1,
      "proxyEnd": -1,
      "dnsStart": 4.867,
      "dnsEnd": 4.891,
      "connectStart": 4.891,
      "connectEnd": 5.116,
      "sslStart": -1,
      "sslEnd": -1,
      "workerStart": -1,
      "workerReady": -1,
      "workerFetchStart": -1,
      "workerRespondWithSettled": -1,
      "sendStart": 5.693,
      "sendEnd": 5.953,
      "pushStart": 0,
      "pushEnd": 0,
      "receiveHeadersEnd": 8.215
    },
    "responseTime": 1598975914099.363,
    "protocol": "http/1.1",
    "securityState": "insecure",
    "_requestId": "4A3268A1B03726D01328E00682A3B76F",
    "dataLength": 981,
    "chunks": 1,
    "_timestamp": 103131.403612
  }
]
```

### metrics

Arguments passed to the event:

```json
[
  {
    "Timestamp": 103131.776603,
    "Documents": 3,
    "Frames": 1,
    "JSEventListeners": 11,
    "Nodes": 23,
    "LayoutCount": 1,
    "RecalcStyleCount": 1,
    "LayoutDuration": 0.025086,
    "RecalcStyleDuration": 0.001696,
    "ScriptDuration": 0.045427,
    "TaskDuration": 0.344488,
    "JSHeapUsedSize": 1598876,
    "JSHeapTotalSize": 2371584
  }
]
```

---
> This file is auto-generated from code comments. Please run `npm run make-docs` to update it.