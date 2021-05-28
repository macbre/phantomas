const assert = require("assert"),
  fs = require("fs");

function pageSource(phantomas) {
  phantomas.on("pageSource", (path) => {
    assert.strictEqual(
      typeof path,
      "string",
      "pageSource event should get a path"
    );

    // https://nodejs.org/api/fs.html#fs_fs_readfilesync_path_options
    const content = fs.readFileSync(path, { encoding: "utf-8" });
    // console.log(content);

    assert.ok(content.indexOf('<h1 id="foo">bar</h1>') > -1);

    fs.rmSync && fs.rmSync(path); // fs.rmSync is not available in Node.js 12.x
  });
}

function screenshot(phantomas) {
  phantomas.on("screenshot", (path) => {
    if (path.indexOf("screenshot-relative.png") >= 0) {
      // If the screenshot path is provided as relative,
      // it should be inside the project's folder.
      path = require("process").cwd() + "/screenshot-relative.png";
    }

    if (path.indexOf("/tmp/screenshot-absolute.png") === 0) {
      // If the screenshot path starts with a slash,
      // it should be absolute.
      path = "/tmp/screenshot-absolute.png";
    }

    assert.strictEqual(
      typeof path,
      "string",
      "screenshot event should get a path"
    );
    assert.ok(fs.existsSync(path), "The file should exist");
    assert.ok(path.match(/.png$/), "The file should be a PNG");

    fs.rmSync && fs.rmSync(path); // fs.rmSync is not available in Node.js 12.x
  });
}

module.exports = {
  pageSource,
  screenshot,
};
