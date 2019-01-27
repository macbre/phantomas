const assert = require('assert'),
    fs = require('fs');

function pageSource(phantomas, batch) {
    var path;

    phantomas.on('pageSource', _path => {
        path = _path;
    });

    batch['HTML file with page should be saved'] = () => {
        assert.ok(typeof path === 'string', 'pageSource event should get a path');

        // https://nodejs.org/api/fs.html#fs_fs_readfilesync_path_options
        const content = fs.readFileSync(path, {encoding: 'utf-8'});
        // console.log(content);

        assert.ok(content.indexOf('<h1 id="foo">bar</h1>') > -1);
    };
}

module.exports = {pageSource};
