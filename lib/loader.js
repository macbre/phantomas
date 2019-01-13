/**
 * Handles loading of modules and extensions
 */
const debug = require('debug'),
    extend = require('util')._extend,
    fs = require('fs');

/**
 * Lists all modules / extensions in a given directory
 * 
 * @param {string} modulesDir 
 * @returns {Array<string}
 */
function listModulesInDirectory(modulesDir) {
    const log = debug('phantomas:modules');
    log('Getting the list of all modules in ' + modulesDir);

    // https://nodejs.org/api/fs.html#fs_fs_readdirsync_path_options
    var ls = fs.readdirSync(modulesDir),
        modules = [];

    ls.forEach(function(entry) {
        // First check whether an entry is a directory, than check if it contains a module file
        // https://nodejs.org/api/fs.html#fs_fs_existssync_path
        if (fs.existsSync(modulesDir + '/' + entry + '/' + entry + '.js')) {
            modules.push(entry);
        }
    });

    return modules.sort();
}

function loadCoreModules(scope) {
    const modules = [
        'navigationTiming',
        'requestsMonitor',
        'timeToFirstByte',
    ];

    modules.forEach(name => {
        var log = debug('phantomas:modules:' + name),
            _scope = extend({}, scope);

        _scope.log = log;

        var module = require(__dirname + '/../core/modules/' + name + '/' + name);
        module(_scope);

        // auto-inject scope.js from module's directory
        var scopeFile = __dirname + '/../core/modules/' + name + '/scope.js';
        if (fs.existsSync(scopeFile)) {
            scope.on('init', () => scope.injectJs(scopeFile));
        }
    });
}

function loadExtensions(scope) {
    const extensions = listModulesInDirectory(__dirname + '/../extensions/');

    extensions.forEach(name => {
        var log = debug('phantomas:extensions:' + name),
            _scope = extend({}, scope);

        _scope.log = log;

        var module = require(__dirname + '/../extensions/' + name + '/' + name);
        module(_scope);
    });
}

function loadModules(scope) {
    const extensions = listModulesInDirectory(__dirname + '/../modules/');

    extensions.forEach(name => {
        var log = debug('phantomas:modules:' + name),
            _scope = extend({}, scope);

        _scope.log = log;

        var module = require(__dirname + '/../modules/' + name + '/' + name);
        module(_scope);

        // auto-inject scope.js from module's directory
        var scopeFile = __dirname + '/../modules/' + name + '/scope.js';
        if (fs.existsSync(scopeFile)) {
            scope.on('init', () => scope.injectJs(scopeFile));
        }
    });
}

module.exports = {loadCoreModules, loadExtensions, loadModules};
