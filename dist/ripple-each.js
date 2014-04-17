;(function(){

/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function _require(path, parent, orig) {
  var resolved = _require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err._require = true;
    throw err;
  }

  var module = _require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, _require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

_require.modules = {};

/**
 * Registered aliases.
 */

_require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

_require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (_require.modules.hasOwnProperty(path)) return path;
    if (_require.aliases.hasOwnProperty(path)) return _require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

_require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

_require.register = function(path, definition) {
  _require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

_require.alias = function(from, to) {
  if (!_require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  _require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

_require.relative = function(parent) {
  var p = _require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return _require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return _require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return _require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
_require.register("component-emitter/index.js", function(exports, _require, module){

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

});
_require.register("ripplejs-array-observer/index.js", function(exports, _require, module){
var emitter = _require('emitter');
var slice = Array.prototype.slice;

module.exports = function(arr) {

  /**
   * Make array an event emitter
   */
  emitter(arr);

  /**
   * Add an element to the end of the collection.
   *
   * @return {Integer} The collection length.
   * @api public
   */

  function push() {
    var self = this;
    var startIndex = this.length;
    var result = Array.prototype.push.apply(this, arguments);
    this.slice(startIndex, this.length).forEach(function(value, i){
      self.emit('add', value, (startIndex + i));
      self.emit('change');
    });
    return result;
  }

  /**
   * Remove the last element from the collection.
   *
   * @return {Integer} The collection length.
   * @api public
   */

  function pop() {
    var startIndex = this.length;
    var result = Array.prototype.pop.apply(this, arguments);
    this.emit('remove', result, startIndex - 1);
    this.emit('change');
    return result;
  }

  /**
   * Remove the first element from the collection.
   *
   * @return {Integer} The collection length.
   * @api public
   */

  function shift() {
    var startIndex = this.length;
    var result = Array.prototype.shift.apply(this, arguments);
    this.emit('remove', result, 0);
    this.emit('change');
    return result;
  }

  /**
   * Add an element to the beginning of the collection.
   *
   * @api public
   */

  function unshift() {
    var self = this;
    var length = this.length;
    var result = Array.prototype.unshift.apply(this, arguments);
    this.slice(0, this.length - length).forEach(function(value, i){
      self.emit('add', value, i);
      self.emit('change');
    });
    return result;
  }

  /**
   * changes the content of an array, adding new elements
   * while removing old elements.
   *
   * @param {Number} index
   * @param {Number} length
   * @param {Items} [items]* Items to add
   *
   * @return {Array}
   */

  function splice(index, length) {
    var self = this;
    var removed = Array.prototype.splice.apply(this, arguments);
    if (removed.length) {
      removed.forEach(function(value, i){
        self.emit('remove', value, index + i);
      });
    }
    if (arguments.length > 2) {
      slice.call(arguments, 2).forEach(function(value, i){
        self.emit('add', value, index + i);
      });
    }
    this.emit('change');
    return removed;
  }

  /**
   * Reverse the items in the array
   *
   * @return {Array}
   */

  function reverse() {
    var result = Array.prototype.reverse.apply(this, arguments);
    this.emit('sort');
    this.emit('change');
    return result;
  }

  /**
   * Sort the items in the array
   *
   * @return {Array}
   */

  function sort() {
    var result = Array.prototype.sort.apply(this, arguments);
    this.emit('sort');
    this.emit('change');
    return result;
  }

  var methods = {
    pop: pop,
    push: push,
    reverse: reverse,
    shift: shift,
    sort: sort,
    splice: splice,
    unshift: unshift
  };

  for (var method in methods) {
    arr[method] = methods[method];
  }

  return arr;
};
});
_require.register("each/index.js", function(exports, _require, module){
var observe = _require('array-observer');

module.exports = function(View) {
  View.directive('each', {
    bind: function(el){
      this.template = el.innerHTML;
      el.innerHTML = '';
      this.previous = {};
    },
    update: function(items, el, view){
      var template = this.template;
      var self = this;
      var replacing = false;
      el.innerHTML = '';

      // The new value isn't an array.
      if(Array.isArray(items) === false) {
        throw new Error(items + ' should be an array');
      }

      // remove the previous emitter so that we don't
      // keep watching the old array for changes
      if(this.previous.emitter) {
        this.previous.emitter.off();
      }

      // Destroy any old views
      if(this.previous.items) {
        this.previous.items.forEach(function(view){
          view.destroy();
        });
      }

      function reposition() {
        items.forEach(function(view, i){
          view.set('$index', i).appendTo(self.node);
        });
      }

      function createViewFromValue(item, i) {
        var data = {};
        if(typeof item === 'object') data = item;
        data.$index = i;
        data.$value = item;
        var child = new View({
          template: template,
          owner: view,
          scope: view,
          data: data
        });
        return child;
      }

      // Replace all objects in the array with views
      items.forEach(function(obj, index){
        var view = createViewFromValue(obj, index);
        items.splice(index, 1, view);
      });

      // Watch the array for changes
      var emitter = observe(items);

      // Items are added to the array
      emitter.on('add', function(item, index){
        if(replacing) return;
        var view = createViewFromValue(item, index);
        replacing = true;
        items.splice(index, 1, view);
        replacing = false;
        reposition();
      });

      // Items are removed from the array
      emitter.on('remove', function(view){
        if(view instanceof View) {
          view.destroy();
          reposition();
        }
      });

      // Re-render everything on a sort
      emitter.on('sort', function(){
        reposition();
      });

      // Add all of the views to the DOM immediately
      reposition();

      // Store it so that we can destroy all of the views
      // if the array is changed
      this.previous.items = items;
      this.previous.emitter = emitter;
    },
    unbind: function(){
      if(this.previous.emitter) {
        this.previous.emitter.off();
      }
      if(this.previous.items) {
        this.previous.items.forEach(function(view){
          view.destroy();
        });
      }
      this.previous = {};
    }
  });
}
});
_require.alias("ripplejs-array-observer/index.js", "each/deps/array-observer/index.js");
_require.alias("ripplejs-array-observer/index.js", "array-observer/index.js");
_require.alias("component-emitter/index.js", "ripplejs-array-observer/deps/emitter/index.js");
if (typeof exports == "object") {
  module.exports = _require("each");
} else if (typeof define == "function" && define.amd) {
  define([], function(){ return _require("each"); });
} else {
  this.ripple.each = _require("each");
}})();
