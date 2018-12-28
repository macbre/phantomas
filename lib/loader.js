/**
 * Handles loading of modules and extensions
 */
const debug = require('debug'),
    extend = require('util')._extend;

function listModulesInDirectory(modulesDir) {
    const log = debug('phantomas:modules');
    log('Getting the list of all modules in ' + modulesDir);

    // https://nodejs.org/api/fs.html#fs_fs_readdirsync_path_options
    var fs = require('fs'),
        ls = fs.readdirSync(modulesDir, {withFileTypes: true}),
        modules = [];

    ls.forEach(function(entry) {
        // First check whether an entry is a directory, than check if it contains a module file
        // https://nodejs.org/api/fs.html#fs_fs_existssync_path
        if (entry.isDirectory() && fs.existsSync(modulesDir + '/' + entry.name + '/' + entry.name + '.js')) {
            modules.push(entry.name);
        }
    });

    return modules.sort();
};


function loadCoreModules(scope) {
    const modules = [
        'navigationTiming',
        'requestsMonitor',
        'timeToFirstByte',
    ];

    modules.forEach(name => {
        var log = debug('phantomas:modules:' + name),
            _scope = extend(scope,{log});
        
        _scope.log('Loading...');

        var module = require(__dirname + '/../core/modules/' + name + '/' + name);
        module(_scope);
    });
}

function loadExtensions(scope) {
    const extensions = listModulesInDirectory(__dirname + '/../extensions/');

    extensions.forEach(name => {
        var log = debug('phantomas:extensions:' + name),
            _scope = extend(scope,{log});
        
        _scope.log('Loading...');

        var module = require(__dirname + '/../extensions/' + name + '/' + name);
        module(_scope);
    });
}

function loadModules(scope) {
    const extensions = listModulesInDirectory(__dirname + '/../modules/');

    extensions.forEach(name => {
        var log = debug('phantomas:modules:' + name),
            _scope = extend(scope,{log});
        
        _scope.log('Loading...');

        var module = require(__dirname + '/../modules/' + name + '/' + name);
        module(_scope);
    });
}

module.exports = {loadCoreModules, loadExtensions, loadModules};
