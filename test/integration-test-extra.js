const assert = require("assert"),
  fs = require("fs");

function pageSource(phantomas, batch) {
  var path;

  phantomas.on("pageSource", (_path) => {
    path = _path;
  });

  batch["HTML file with page should be saved"] = () => {
    assert.ok(typeof path === "string", "pageSource event should get a path");

    // https://nodejs.org/api/fs.html#fs_fs_readfilesync_path_options
    const content = fs.readFileSync(path, { encoding: "utf-8" });
    // console.log(content);

    assert.ok(content.indexOf('<h1 id="foo">bar</h1>') > -1);
  };
}

function screenshot(phantomas, batch) {
  var path;

  phantomas.on("screenshot", (_path) => {
    path = _path;

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
  });

  batch["PNG file should be saved"] = () => {
    assert.ok(typeof path === "string", "screenshot event should get a path");
    assert.ok(fs.existsSync(path), "The file should exist");
    assert.ok(path.match(/.png$/), "The file should be a PNG");
  };
}

module.exports = {
  pageSource,
  screenshot,
};
