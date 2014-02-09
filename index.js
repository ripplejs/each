module.exports = function(ripple) {
  ripple.attribute(/on-([a-z]+)/, function(view, node, attr, eventName){
    var eventType = attr.replace('on-','');
    function callback(e){
      view.emit(eventName, e);
    }
    view.on('bind', function(){
      node.addEventListener(eventType, callback, true);
      view.once('unbind', function(){
        node.removeEventListener(eventType, callback, true);
      });
    });
  });
};