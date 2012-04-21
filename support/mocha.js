var nodify = '../nodify.js';
phantom.injectJs(nodify);

var assert, should, expect;

nodify.run(function() {
  global.assert = require('chai').assert;
  global.should = require('chai').should();
  global.expect = require('chai').expect;
  var fs = require('fs');
  var Mocha = require('mocha');

  function findFiles(path, re) {
    var files = [];
    path = fs.absolute(path); 

    if (fs.isFile(path)) return [path];

    fs.list(path).forEach(function(entry) {
      if (entry !== '.' && entry !== '..') {
        entry = path + fs.separator + entry;
        if (fs.isDirectory(entry)) {
          files.push.apply(files, findFiles(entry, re));
        } else if (entry.match(re)) {
          files.push(entry);
        }
      }
    });

    return files;
  };

  var mocha = new Mocha({ ui: 'bdd', reporter: 'spec' });
  findFiles('./spec', /_spec\.(js|coffee)$/).forEach(mocha.addFile.bind(mocha));
  mocha.run(process.exit);
});
