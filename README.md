phantomjs-nodify
================

Set of scripts that make [PhantomJS](http://www.phantomjs.org/) environment
more similar to [Node.js](http://nodejs.org/).
I implemented what I needed for my scripts. Feel free to fork and add more.

Implemented features:

* Module support mostly compatible with CommonJS and Node.js, i.e. `require()`
  works not only for PhantomJS built-in modules. Most of the functionality from
  [Node.js Modules](http://nodejs.org/api/modules.html) (up to
  [The `module` Object](http://nodejs.org/api/modules.html#modules_the_module_object))
  should work.
* Exceptions thrown from required files are properly reported (with file name
  and line number). Line number for `.coffee` files may not be accurate.
  _Unfortunately this is [broken in PhantomJS 1.5](http://code.google.com/p/phantomjs/issues/detail?id=510)_
* Global `process` object (some basic functionality + emits `uncaughtException`
  on exceptions that occur inside `setTimeout` blocks).
* `console` with string formatting (e.g. `console.log('hello %s', 'world')`).
* Some Node.js modules (see `modules` dir).
* Other minor tweaks.

Some code taken from [Node.js](http://nodejs.org/).
Uses [CoffeeScript](http://jashkenas.github.com/coffee-script/)
and [Mocha](http://visionmedia.github.com/mocha/) + [Chai](http://chaijs.com/)
for testing.


How to use
----------

Clone:

    git clone git://github.com/jgonera/phantomjs-nodify.git

If you want to use CoffeeScript, clone with submodules:

    git clone git://github.com/jgonera/phantomjs-nodify.git --recursive

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


### Stubbing `require()`

Since commit 102b7fd1c17a8a12ce686f0c0fdc4d728087176a you can stub required
modules in the given module context. For example, let's say you have a module
file `a.js` in the same directory as your main script. You require this module
in the main script (`require('./a')`). Then, `a.js` contains:

```js
require.stub('zlib', {
  createGzip: function() { ... }
});

var something = require('some_node.js_module_that_requires_zlib');
```

Now `require('zlib')` will return the object with the `createGzip` function in
`a.js` and in every module required by it, but not in parent modules (in this
case `require('zlib')` will throw a "Cannot find module" exception in the main
script).

This is especially useful when trying to require libraries written for Node.js
which require modules not included in phantomjs-nodify.


Running tests
-------------

If you fork and add something, please write tests for it.
You can run the tests after fetching the necessary submodules:

    git submodule init
    git submodule update
    make test

