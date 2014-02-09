var createView = require('view');
var observe = require('array-observer');

module.exports = function(ripple) {
  ripple.attribute(/foreach-[a-z]+/, function(view, node, attr, value){
    var template = node.innerHTML;
    var name = attr.replace('foreach-', '');
    var compile = this.compile.bind(this);
    var emitter;
    var views;

    function renderItem(item, i) {
      var View = createView(template, compile);
      var data = {};
      data[name] = item;
      data.index = i;
      var view = new View(data);
      return view;
    }

    function renderItems(items) {
      return items.map(renderItem);
    }

    function destroy(views) {
      views.forEach(function(view){
        view.unbind();
        view.unmount();
      });
    }

    function mount() {
      views.forEach(function(view, i){
        view.set('index', i);
        view.mount(node);
      });
    }

    function add(added, index) {
      var splice = views.splice.bind(views, index, 0);
      splice.apply(views, added);
    }

    function remove(removed, index) {
      destroy(views.splice(index, removed.length));
    }

    function change() {
      node.innerHTML = '';

      // The array from the model that we
      // want to render and watch for changes
      var items = view.get(value);

      // remove the previous emitter so that we don't
      // keep watching the old array for changes
      if(emitter) emitter.off();

      // If we have an array of views, remove all of them
      // so that their bindings don't hang around
      if(views) destroy(views);

      // The new value isn't an array. So just do nothing
      if(Array.isArray(items) === false) {
        throw new Error(value + ' should be an array');
      }

      // An array for view objects for each item in the array
      views = renderItems(items);

      // Watch the array for changes
      emitter = observe(items);

      emitter.on('add', function(added, index){
        add(added.map(renderItem), index);
        mount(views);
      });

      emitter.on('remove', function(removed, index){
        remove(removed, index);
        mount(views);
      });

      // Re-render everything on a sort
      emitter.on('sort', change);

      mount(views);
    }

    node.innerHTML = '';
    view.state.change(value, change);
    change();
  });
};