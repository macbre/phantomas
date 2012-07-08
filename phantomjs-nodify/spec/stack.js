var nodify = '../nodify.js';
phantom.injectJs(nodify);

nodify.run(function() {
  require('./thrower');
});
