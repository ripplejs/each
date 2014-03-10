var observe = require('array-observer');
var dom = require('fastdom');

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
    var compiler = this;
    var fragment = document.createDocumentFragment();
    var parsed = parseValue(value);
    var template = node.innerHTML;
    var emitter;
    var views;

    node.innerHTML = "";
    node.appendChild(fragment);

    function renderItem(item, i) {
      var data = {};
      data[parsed.key] = item;
      if(parsed.index) data[parsed.index] = i;
      var child = View.create({
        state: data,
        props: {
          index: i
        },
        owner: view
      });
      return child;
    }

    function destroy(views) {
      views.forEach(function(view){
        view.unmount();
      });
    }

    function mount() {
      views.forEach(function(view, i){
        view.set(parsed.index, i);
        view.mount(fragment, {
          template: template
        });
      });
      dom.write(function(){
        node.appendChild(fragment);
      });
    }

    function add(added, index) {
      var splice = views.splice.bind(views, index, 0);
      splice.apply(views, added);
    }

    function remove(removed, index) {
      destroy(views.splice(index, removed.length));
    }

    function change(items) {
      node.innerHTML = '';

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
      views = items.map(renderItem);

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
      emitter.on('sort', change.bind(null, items));

      mount(views);
    }

    this.view.interpolate(parsed.property, change);
  });
};