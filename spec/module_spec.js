describe("Module", function() {
  it("has filename property containing its absolute path", function() {
    module.filename.should.match(/\/.*spec\/module_spec.js/);
  });

  it("has id property equal to filename", function() {
    module.id.should.equal(module.filename);
  });

  it("has dirname property containing absolute path to its directory", function() {
    module.dirname.should.match(/\/.*spec/);
  });

  it("has cache object attached to its require() containing cached modules", function() {
    var dummy = require('dummy_exposed');
    should.exist(require.cache);
    require.cache[module.filename].should.equal(module);
    require.cache[dummy.filename].should.equal(dummy);
  });
});
