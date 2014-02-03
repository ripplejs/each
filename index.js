module.exports = function(ripple) {
  ripple.attribute(/on-([a-z]+)/, function(node, attr, value){
    var eventName = attr.replace('on-','');
    var view = this.view;
    node.addEventListener(eventName, function(e){
      view.emit(value, e);
    }, true);
  });
};