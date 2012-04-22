if (typeof nodify !== 'string') {
  console.error("Global variable `nodify` not set or not a string!");
  phantom.exit(1);
}

var global = window, process;

(function() {
  // common stuff
  
  var fs = require('fs');
  
  function dirname(path) {
    return path.replace(/\/[^\/]*\/?$/, '');
  };
  
  function basename(path) {
    return path.replace(/.*\//, '');
  };
  
  function joinPath() {
    var args = Array.prototype.slice.call(arguments);
    return args.join(fs.separator);
  };
  
  var rootPath = fs.absolute(phantom.libraryPath);
  var nodifyPath = fs.absolute(joinPath(rootPath, dirname(nodify)));
  var sourceIds = {};
  nodify = {};

  function getErrorMessage(e, withMessage) {
    withMessage = typeof withMessage === 'undefined' ? true : withMessage;
    return (e.fileName || sourceIds[e.sourceId]) + ':' + e.line +
      (withMessage ? ' ' + e : '');
  };

  // patches
  
  // TODO: remove when PhantomJS has full module support
  function patchRequire() {
    phantom.injectJs(joinPath(nodifyPath, 'coffee-script.js'));
    var phantomRequire = nodify.__orig__require = require;
    var requireCache = {};
    
    require = getRequire(joinPath(rootPath, phantom.scriptName));

    function getPaths(requireDir, path) {
      var paths = [], fileGuesses = [], dir;

      if (path[0] === '.') {
        paths.push(fs.absolute(joinPath(requireDir, path)));
      } else if (path[0] === '/') {
        paths.push(fs.absolute(path));
      } else {
        dir = requireDir;
        while (dir !== '') {
          paths.push(joinPath(dir, 'node_modules', path));
          dir = dirname(dir);
        }
        paths.push(joinPath(nodifyPath, 'modules', path));
      }
      
      for (var i = 0; i < paths.length; ++i) {
        fileGuesses.push.apply(fileGuesses, [
          paths[i],
          paths[i] + '.js',
          paths[i] + '.coffee',
          joinPath(paths[i], 'index.js'),
          joinPath(paths[i], 'index.coffee')
        ]);
      }

      return fileGuesses;
    }
    
    function getRequire(parentFile) {
      var requireDir = dirname(parentFile);

      return function(path) {
        var fileGuesses, file, packageFile, package, code, fn;
        var module = { exports: {} };

        if (['fs', 'webpage', 'webserver', 'system'].indexOf(path) !== -1) {
          return phantomRequire(path);
        } else {
          fileGuesses = getPaths(requireDir, path);
          
          while (file = fileGuesses.shift()) {
            if (fs.isFile(file)) {
              break;
            } else if (fs.isDirectory(file)) {
              packageFile = joinPath(file, 'package.json');
              if (fs.isFile(packageFile)) {
                package = JSON.parse(fs.read(packageFile));
                fileGuesses.unshift(joinPath(file, package.main + '.coffee'));
                fileGuesses.unshift(joinPath(file, package.main + '.js'));
                fileGuesses.unshift(joinPath(file, package.main));
              }
            }
          }
          if (!file) {
            var e = new Error("Cannot find module '" + path + "'");
            e.fileName = parentFile;
            e.line = '';
            throw e;
          }

          if (file in requireCache) return requireCache[file].exports;

          code = fs.read(file);
          if (file.match(/\.coffee$/)) {
            try {
              code = CoffeeScript.compile(code);
            } catch (e) {
              e.fileName = file;
              throw e;
            }
          }
          // a trick to associate Error's sourceId with file
          code += ";throw new Error('__sourceId__');";
          try {
            fn = new Function('require', 'exports', 'module', code);
            fn(getRequire(file), module.exports, module);
          } catch (e) {
            // assign source id
            sourceIds[e.sourceId] = file;
            // if it's not the error we added, propagate it
            if (e.message !== '__sourceId__') {
              throw e;
            }
          }
          
          requireCache[file] = module;
          
          return module.exports;
        }
      };
    }
  };
  
  // process
  function addProcess() {
    var EventEmitter = require('events').EventEmitter;
    process = new EventEmitter;
    process.env = {};
    process.nextTick = function(fn) { fn() };
    process.exit = function(status) {
      process.emit('exit');
      phantom.exit(status);
    };
    process.stdout = {
      write: function(string) { fs.write("/dev/stdout", string, "w"); }
    };
    process.stderr = {
      write: function(string) { fs.write("/dev/stderr", string, "w"); }
    };
    process.argv = ['nodify', phantom.scriptName].concat(phantom.args);
    process.cwd = function() {
      return rootPath;
    };
    
    var phantomSetTimeout = nodify.__orig__setTimeout = setTimeout;
    setTimeout = function(fn, delay) {
      return phantomSetTimeout(function() {
        try {
          fn();
        } catch (e) {
          process.emit('uncaughtException', e);
        }
      }, delay);
    };
  };
  
  // make errors in event listeners propagate to uncaughtException
  function patchEvents() {
    var EventEmitter = require('events').EventEmitter;
    
    var eventEmitterEmit = EventEmitter.prototype.emit;
    EventEmitter.prototype.emit = function() {
      try {
        return eventEmitterEmit.apply(this, arguments);
      } catch (e) {
        process.emit('uncaughtException', e);
      }
    }
  }; 
  
  // better console
  function patchConsole() {
    var util = require('util');
    ['log', 'error', 'debug', 'warn', 'info'].forEach(function(fn) {
      var fn_ = '__orig__' + fn;
      console[fn_] = console[fn];
      console[fn] = function() {
        console[fn_](util.format.apply(this, arguments));
      };
    });
  };
  
  // dummy stack trace
  // TODO: remove when PhantomJS gets JS engine upgrade
  function addErrorStack() {
    Object.defineProperty(Error.prototype, 'stack', {
      set: function(string) { this._stack = string; },
      get: function() {
        if (this._stack) {
          return this._stack;
        } else if (this.fileName || this.sourceId) {
          return this.toString() + '\nat ' + getErrorMessage(this, false);
        }
        return this.toString() + '\nat unknown';
      },
      configurable: true,
      enumerable: true
    });
  };

  // Function.bind
  // TODO: remove when PhantomJS gets JS engine upgrade
  function addFunctionBind() {
    if (!Function.prototype.bind) {
      Function.prototype.bind = function (oThis) {
        if (typeof this !== "function") {
          // closest thing possible to the ECMAScript 5 internal IsCallable function
          throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable"); 
        } 
        
        var aArgs = Array.prototype.slice.call(arguments, 1), 
          fToBind = this, 
          fNOP = function () {},
          fBound = function () {
            return fToBind.apply(this instanceof fNOP 
                                   ? this 
                                   : oThis || window, 
                                 aArgs.concat(Array.prototype.slice.call(arguments)));
          };
        
        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();
        
        return fBound;
      };
    }
  };
  
  // dummy Buffer
  function addBuffer() {
    global.Buffer = {
      isBuffer: function() { return false; }
    };
  };

  // nodify
  
  patchRequire();
  addProcess();
  patchEvents();
  patchConsole();
  addErrorStack();
  addFunctionBind();
  addBuffer();
  
  nodify.run = function(fn) {
    try {
      fn();
    } catch(e) {
      console.error(getErrorMessage(e));
      phantom.exit(1);
    }
  };
  
}());

