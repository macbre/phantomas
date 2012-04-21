describe("require()", function() {
  it("loads native PhantomJS modules", function() {
    should.exist(require('webpage').create);
    should.exist(require('fs').separator);
    if (phantom.version.major >= 1 && phantom.version.minor >= 4) {
      should.exist(require('webserver').create);
    }
    if (phantom.version.major >= 1 && phantom.version.minor >= 5) {
      require('system').platform.should.equal('phantomjs');
    }
  });

  it("loads phantomjs-nodify modules", function() {
    should.exist(require('assert').AssertionError);
    should.exist(require('events').EventEmitter);
    should.exist(require('http').STATUS_CODES);
    should.exist(require('path').dirname);
    should.exist(require('tty').isatty);
    should.exist(require('util').inspect);
  });

  it("loads CoffeeScript modules", function() {
    require('./coffee_dummy').should.equal('require/coffee_dummy');
  });

  describe("when the path is relative", function() {
    it("loads modules from the same directory", function() {
      require('./dummy').should.equal('require/dummy');
    });

    it("loads modules from the parent directory", function() {
      require('../dummy').should.equal('spec/dummy');
    });

    it("loads modules from a child directory", function() {
      require('./dir/dummy').should.equal('dir/dummy');
    });

    it("loads modules from a deeper directory", function() {
      require('./dir/subdir/dummy').should.equal('subdir/dummy');
    });

    it("loads modules when path has intertwined '..'", function() {
      require('./dir/../dummy').should.equal('require/dummy');
    });

    it("loads modules when path has intertwined '.'", function() {
      require('./dir/./dummy').should.equal('dir/dummy');
    });
  });

  describe("when loading from node_modules", function() {
    it("first tries to load from ./node_modules", function() {
      require('dummy_file').should.equal('require/node_modules/dummy_file');
    });

    it("loads from ../node_modules", function() {
      require('dummy_file2').should.equal('spec/node_modules/dummy_file2');
    });

    it("loads from further up the directory tree", function() {
      require('./dir/subdir/loader').dummyFile2.should.equal('spec/node_modules/dummy_file2');
    });

    it("loads index.js if module is a directory", function() {
      require('dummy_module').should.equal('require/node_modules/dummy_module');
    });
  });
});
