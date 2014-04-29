
;(function(){

/**
 * Require the module at `name`.
 *
 * @param {String} name
 * @return {Object} exports
 * @api public
 */

function _require(name) {
  var module = _require.modules[name];
  if (!module) throw new Error('failed to require "' + name + '"');

  if (!('exports' in module) && typeof module.definition === 'function') {
    module.client = module.component = true;
    module.definition.call(this, module.exports = {}, module);
    delete module.definition;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

_require.modules = {};

/**
 * Register module at `name` with callback `definition`.
 *
 * @param {String} name
 * @param {Function} definition
 * @api private
 */

_require.register = function (name, definition) {
  _require.modules[name] = {
    definition: definition
  };
};

/**
 * Define a module's exports immediately with `exports`.
 *
 * @param {String} name
 * @param {Generic} exports
 * @api private
 */

_require.define = function (name, exports) {
  _require.modules[name] = {
    exports: exports
  };
};
_require.register("component~emitter@1.1.2", function (exports, module) {

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

_require.register("ripplejs~array-observer@0.3.0", function (exports, module) {
var emitter = _require("component~emitter@1.1.2");
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

_require.register("each", function (exports, module) {
var observe = _require("ripplejs~array-observer@0.3.0");

module.exports = function(View) {
  View.directive('each', {
    bind: function(el){
      this.View = View.create(el.innerHTML);
      el.innerHTML = '';
      this.previous = {};
    },
    update: function(items, el, view){
      var Child = this.View;
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
        var child = new Child({
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
        if(view instanceof Child) {
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

if (typeof exports == "object") {
  module.exports = _require("each");
} else if (typeof define == "function" && define.amd) {
  define([], function(){ return _require("each"); });
} else {
  this.ripple.each = _require("each");
}
})()
