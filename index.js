var observe = require('array-observer');

function parseValue(value) {
  var parts = value.split(' in ');
  var first = parts[0].split(',');
  return {
    property: parts.pop().trim(),
    key: first[0].trim(),
    index: (first.length === 2) ? first[1].trim() : false
  };
}

module.exports = function(View) {
  View.directive('each', function(view, node, attr, value){
    var parsed = parseValue(value);
    var template = node.innerHTML;
    var compile = this.compile.bind(this);
    var emitter;
    var views;

    function renderItem(item, i) {
      var Child = View.create(template);
      var data = {};
      data[parsed.key] = item;
      if(parsed.index) data[parsed.index] = i;
      var child = new Child(data, view);
      return child;
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
      var items = view.get(parsed.property);

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
    view.change(parsed.property, change);
    change();
  });
};