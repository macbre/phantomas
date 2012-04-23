phantomjs-nodify
================

Set of scripts that make [PhantomJS](http://www.phantomjs.org/) environment
more similar to [Node.js](http://nodejs.org/).
I implemented what I needed for my scripts. Feel free to fork and add more.

Implemented features:

* Module support mostly compatible with CommonJS and Node.js, i.e. `require()`
  works not only for PhantomJS built-in modules.
* Exceptions thrown from required files are properly reported (with file name
  and line number). Line number for `.coffee` files may not be accurate.
  _Unfortunately this is [broken in PhantomJS 1.5](http://code.google.com/p/phantomjs/issues/detail?id=510)_
* Global `process` object (some basic functionality + emits `uncaughtException`
  on exceptions that occur inside `setTimeout` blocks).
* `console` with string formatting (e.g. `console.log('hello %s', 'world')`).
* Some Node.js modules (see `modules` dir).
* Other minor tweaks.

Some code taken from [Node.js](http://nodejs.org/)
and [CoffeeScript](http://jashkenas.github.com/coffee-script/).
Uses [Mocha](http://visionmedia.github.com/mocha/)
and [Chai](http://chaijs.com/) for testing.


How to use
----------

Clone:

    git clone git://github.com/jgonera/phantomjs-nodify.git

Inject in your PhantomJS script at the very first line:

```js
var nodify = 'phantomjs-nodify/nodify.js';
phantom.injectJs(nodify);
```

You **must** provide the path to `nodify.js` in the global `nodify` variable.

Then, wrap your script in `nodify.run()`:

```js
var nodify = 'phantomjs-nodify/nodify.js';
phantom.injectJs(nodify);

nodify.run(function() {
  // module taken from Node.js and included in phantomjs-nodify
  var assert = require('assert');
  // module in the same directory
  var myModule = require('./mymodule');
  // module in a `node_modules` directory
  var nodeModule = require('nodemodule');

  // your script here
});
```

Running tests
-------------

If you fork and add something, please write tests for it.
You can run the tests after fetching the necessary submodules:

    git submodule init
    git submodule update
    make test

