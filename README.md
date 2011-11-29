phantomjs-nodify
================

Set of scripts that make PhantomJS's environment more similar to Node.js.
I implemented what I needed for my scripts. Feel free to add more.

Partially implemented features:

* Experimental `require()` support for custom (not built into PhatnomJS)
  modules. Use relative or absolute paths to include your modules (i.e. they
  must start with `.`, `..` or `/`).
* Exceptions thrown from required files are properly reported (with file name
  and line number). Line number for `.coffee` files may not be accurate.
* Global `process` variable.
* `console` with string formatting (e.g. `console.log('hello %s', 'world')`).
* Some Node.js modules (see `modules` dir).
* Other minor tweaks.

Some code taken from Node.js, CoffeeScript and [mocha](http://visionmedia.github.com/mocha/).


How to use
----------

Clone:

    git clone git://github.com/jgonera/phantomjs-nodify.git

Inject in your PhantomJS script at the very first line:

    var nodify = 'phantomjs-nodify/nodify.js';
    phantom.injectJs(nodify);

You **must** provide the path to `nodify.js` in the global `nodify` variable.

Then, wrap your script in `nodify.run()`:

    var nodify = 'phantomjs-nodify/nodify.js';
    phantom.injectJs(nodify);
    
    nodify.run(function() {
      var assert = require('assert');
      var myModule = require('./mymodule');
      // your script here
    });

