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
      "User-Agent": "phantomas/2.0.0-beta (HeadlessChrome/72.0.3617.0)"
    },
    "mixedContentType": "none",
    "initialPriority": "VeryHigh",
    "referrerPolicy": "no-referrer-when-downgrade",
    "_requestId": "0DF55D2959E58FA968527228D27B52FB",
    "_timestamp": 10762.711753,
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
      "User-Agent": "phantomas/2.0.0-beta (HeadlessChrome/72.0.3617.0)"
    },
    "mixedContentType": "none",
    "initialPriority": "VeryHigh",
    "referrerPolicy": "no-referrer-when-downgrade",
    "_requestId": "0DF55D2959E58FA968527228D27B52FB",
    "_timestamp": 10762.711753,
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
      "server": "ecstatic-2.2.1",
      "last-modified": "Sat, 02 Feb 2019 17:21:13 GMT",
      "etag": "\"3112379-981-\"2019-02-02T17:21:13.659Z\"\"",
      "cache-control": "max-age=84600",
      "content-length": "981",
      "content-type": "text/html; charset=UTF-8",
      "Date": "Sun, 03 Feb 2019 14:01:24 GMT",
      "Connection": "keep-alive"
    },
    "headersText": "HTTP/1.1 200 OK\r\nserver: ecstatic-2.2.1\r\nlast-modified: Sat, 02 Feb 2019 17:21:13 GMT\r\netag: \"3112379-981-\"2019-02-02T17:21:13.659Z\"\"\r\ncache-control: max-age=84600\r\ncontent-length: 981\r\ncontent-type: text/html; charset=UTF-8\r\nDate: Sun, 03 Feb 2019 14:01:24 GMT\r\nConnection: keep-alive\r\n\r\n",
    "mimeType": "text/html",
    "requestHeaders": {
      "Host": "0.0.0.0:8888",
      "Connection": "keep-alive",
      "Upgrade-Insecure-Requests": "1",
      "User-Agent": "phantomas/2.0.0-beta (HeadlessChrome/72.0.3617.0)",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
      "Accept-Encoding": "gzip, deflate"
    },
    "requestHeadersText": "GET /lazy-load-scroll.html HTTP/1.1\r\nHost: 0.0.0.0:8888\r\nConnection: keep-alive\r\nUpgrade-Insecure-Requests: 1\r\nUser-Agent: phantomas/2.0.0-beta (HeadlessChrome/72.0.3617.0)\r\nAccept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8\r\nAccept-Encoding: gzip, deflate\r\n",
    "connectionReused": false,
    "connectionId": 11,
    "remoteIPAddress": "0.0.0.0",
    "remotePort": 8888,
    "fromDiskCache": false,
    "fromServiceWorker": false,
    "encodedDataLength": 0,
    "timing": {
      "requestTime": 10762.712068,
      "proxyStart": -1,
      "proxyEnd": -1,
      "dnsStart": 35.381,
      "dnsEnd": 35.417,
      "connectStart": 35.417,
      "connectEnd": 35.592,
      "sslStart": -1,
      "sslEnd": -1,
      "workerStart": -1,
      "workerReady": -1,
      "sendStart": 35.652,
      "sendEnd": 35.683,
      "pushStart": 0,
      "pushEnd": 0,
      "receiveHeadersEnd": 36.835
    },
    "protocol": "http/1.1",
    "securityState": "neutral",
    "_requestId": "0DF55D2959E58FA968527228D27B52FB",
    "dataLength": 981,
    "chunks": 1,
    "_timestamp": 10762.749706
  }
]
```

### recv

Arguments passed to the event:

```json
[
  {
    "id": "0DF55D2959E58FA968527228D27B52FB",
    "url": "http://0.0.0.0:8888/lazy-load-scroll.html",
    "method": "GET",
    "headers": {
      "server": "ecstatic-2.2.1",
      "last-modified": "Sat, 02 Feb 2019 17:21:13 GMT",
      "etag": "\"3112379-981-\"2019-02-02T17:21:13.659Z\"\"",
      "cache-control": "max-age=84600",
      "content-length": "981",
      "content-type": "text/html; charset=UTF-8",
      "date": "Sun, 03 Feb 2019 14:01:24 GMT",
      "connection": "keep-alive"
    },
    "bodySize": 981,
    "transferedSize": 981,
    "headersSize": 289,
    "responseSize": 1270,
    "type": "html",
    "protocol": "http",
    "domain": "0.0.0.0",
    "query": null,
    "stalled": 35.652,
    "timeToFirstByte": 1.152000000000001,
    "timeToLastByte": 0.037953000000925385,
    "contentType": "text/html",
    "isHTML": true,
    "status": 200,
    "statusText": "OK"
  },
  {
    "url": "http://0.0.0.0:8888/lazy-load-scroll.html",
    "status": 200,
    "statusText": "OK",
    "headers": {
      "server": "ecstatic-2.2.1",
      "last-modified": "Sat, 02 Feb 2019 17:21:13 GMT",
      "etag": "\"3112379-981-\"2019-02-02T17:21:13.659Z\"\"",
      "cache-control": "max-age=84600",
      "content-length": "981",
      "content-type": "text/html; charset=UTF-8",
      "Date": "Sun, 03 Feb 2019 14:01:24 GMT",
      "Connection": "keep-alive"
    },
    "headersText": "HTTP/1.1 200 OK\r\nserver: ecstatic-2.2.1\r\nlast-modified: Sat, 02 Feb 2019 17:21:13 GMT\r\netag: \"3112379-981-\"2019-02-02T17:21:13.659Z\"\"\r\ncache-control: max-age=84600\r\ncontent-length: 981\r\ncontent-type: text/html; charset=UTF-8\r\nDate: Sun, 03 Feb 2019 14:01:24 GMT\r\nConnection: keep-alive\r\n\r\n",
    "mimeType": "text/html",
    "requestHeaders": {
      "Host": "0.0.0.0:8888",
      "Connection": "keep-alive",
      "Upgrade-Insecure-Requests": "1",
      "User-Agent": "phantomas/2.0.0-beta (HeadlessChrome/72.0.3617.0)",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
      "Accept-Encoding": "gzip, deflate"
    },
    "requestHeadersText": "GET /lazy-load-scroll.html HTTP/1.1\r\nHost: 0.0.0.0:8888\r\nConnection: keep-alive\r\nUpgrade-Insecure-Requests: 1\r\nUser-Agent: phantomas/2.0.0-beta (HeadlessChrome/72.0.3617.0)\r\nAccept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8\r\nAccept-Encoding: gzip, deflate\r\n",
    "connectionReused": false,
    "connectionId": 11,
    "remoteIPAddress": "0.0.0.0",
    "remotePort": 8888,
    "fromDiskCache": false,
    "fromServiceWorker": false,
    "encodedDataLength": 0,
    "timing": {
      "requestTime": 10762.712068,
      "proxyStart": -1,
      "proxyEnd": -1,
      "dnsStart": 35.381,
      "dnsEnd": 35.417,
      "connectStart": 35.417,
      "connectEnd": 35.592,
      "sslStart": -1,
      "sslEnd": -1,
      "workerStart": -1,
      "workerReady": -1,
      "sendStart": 35.652,
      "sendEnd": 35.683,
      "pushStart": 0,
      "pushEnd": 0,
      "receiveHeadersEnd": 36.835
    },
    "protocol": "http/1.1",
    "securityState": "neutral",
    "_requestId": "0DF55D2959E58FA968527228D27B52FB",
    "dataLength": 981,
    "chunks": 1,
    "_timestamp": 10762.749706
  }
]
```

### metrics

Arguments passed to the event:

```json
[
  {
    "Timestamp": 10762.802943,
    "Documents": 2,
    "Frames": 1,
    "JSEventListeners": 11,
    "Nodes": 19,
    "LayoutCount": 1,
    "RecalcStyleCount": 1,
    "LayoutDuration": 0.009849,
    "RecalcStyleDuration": 0.000208,
    "ScriptDuration": 0.016547,
    "TaskDuration": 0.053504,
    "JSHeapUsedSize": 2470408,
    "JSHeapTotalSize": 4546560
  }
]
```

---
> This file is auto-generated from code comments. Please run `npm run make-docs` to update it.