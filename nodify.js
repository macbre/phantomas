if (typeof nodify !== 'string') {
  console.error("Global variable `nodify` not set or not a string!");
  phantom.exit(1);
}

var global = window, process;

(function() {
  // common stuff
  
  var fs = require('fs');
  
  var dirname = function(path) {
    return path.replace(/\/[^\/]*\/?$/, '');
  };
  
  var basename = function(path) {
    return path.replace(/.*\//, '');
  };
  
  var joinPath = function() {
    var args = Array.prototype.slice.call(arguments);
    return args.join(fs.separator);
  };
  
  var rootPath = phantom.libraryPath;
  var nodifyPath = joinPath(rootPath, dirname(nodify));
  var sourceIds = {};
  nodify = {};

  var getErrorMessage = function(e) {
    return (e.fileName || sourceIds[e.sourceId]) + ':' + e.line + ' ' + e;
  };

  // patches
  
  // process
  var addProcess = function() {
    process = {};
    process.env = {};
    process.nextTick = function(fn) { fn() };
    process.on = function() {};
    process.removeListener = function() {};
    process.exit = function(status) { phantom.exit(status); };
    process.stdout = {
      write: function(string) { fs.write("/dev/stdout", string, "w"); }
    };
    process.stderr = {
      write: function(string) { fs.write("/dev/stderr", string, "w"); }
    };
  };
  
  // TODO: remove when PhantomJS has full module support
  var patchRequire = function() {
    phantom.injectJs(joinPath(nodifyPath, 'coffee-script.js'));
    var phantomRequire = nodify.__orig__require = require;
    var requireDir = rootPath;
    var requireCache = {};
    
    require = function(path) {
      var i, dir, paths = [], fileGuesses = [path], file, code, fn;
      var oldRequireDir = requireDir;
      var module = { exports: {} };

      if (path === 'fs' || path === 'webpage' || path === 'webserver') {
        return phantomRequire(path);
      } else {
        if (path[0] === '.') {
          paths.push(fs.absolute(joinPath(requireDir, path)));
        } else if (path[0] !== '/') {
          dir = requireDir;
          while (dir !== '') {
            paths.push(fs.absolute(joinPath(dir, 'node_modules', path)));
            dir = dirname(dir);
          }
          paths.push(fs.absolute(joinPath(nodifyPath, 'modules', path)));
        }
        
        for (i = 0; i < paths.length; ++i) {
          fileGuesses.push.apply(fileGuesses, [
            paths[i],
            paths[i] + '.js',
            paths[i] + '.coffee',
            joinPath(paths[i], 'index.js'),
            joinPath(paths[i], 'index.coffee'),
            joinPath(paths[i], 'lib', basename(paths[i]) + '.js'),
            joinPath(paths[i], 'lib', basename(paths[i]) + '.coffee')
          ]);
        };
        
        file = null;
        for (i = 0; i < fileGuesses.length && !file; ++i) {
          if (fs.isFile(fileGuesses[i])) {
            file = fileGuesses[i];
          }
        };
        if (!file) {
          throw new Error("Can't find module " + path);
        }
        
        if (file in requireCache) {
          return requireCache[file].exports;
        }

        requireDir = dirname(file);
        
        code = fs.read(file);
        if (file.match(/\.coffee$/)) {
          try {
            code = CoffeeScript.compile(code);
          } catch(e) {
            e.fileName = file;
            throw e;
          }
        }
        // a trick to associate Error's sourceId with file
        code += ";throw new Error('__sourceId__');";
        try {
          fn = new Function('module', 'exports', code);
          fn(module, module.exports);
        } catch(e) {
          //console.log(e.sourceId + ':' + file);
          if (!sourceIds.hasOwnProperty(e.sourceId)) {
            sourceIds[e.sourceId] = file;
          }
          if (e.message !== '__sourceId__') {
            throw e;
          }
        }
        
        requireDir = oldRequireDir;
        requireCache[file] = module;
        
        return module.exports;
      }
    };
  };
  
  // better console
  var patchConsole = function() {
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
  var addErrorStack = function() {
    Object.defineProperty(Error.prototype, 'stack', {
      set: function(string) { this._stack = string; },
      get: function() {
        if (this._stack) {
          return this._stack;
        } else if (this.fileName || this.sourceId) {
          return this.toString() + '\nat ' + getErrorMessage(this);
        }
        return this.toString() + '\nat unknown';
      },
      configurable: true,
      enumerable: true
    });
  };

  // Function.bind
  // TODO: remove when PhantomJS gets JS engine upgrade
  var addFunctionBind = function() {
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
  var addBuffer = function() {
    global.Buffer = {
      isBuffer: function() { return false; }
    };
  };

  // nodify
  
  patchRequire();
  // we can now require not built-in modules
  var util = require('util');
  
  addProcess();
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

