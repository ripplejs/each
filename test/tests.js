var ripple = require('ripple')();
var assert = require('assert');
var trigger = require('trigger-event');
var events = require('events');

ripple.use(events);

describe('events', function(){

  it('should bind to events', function(done){
    var View = ripple.compile('<div on-click="foo"></div>');
    View.event('foo', function(){
      done();
    });
    var view = new View();
    trigger(view.el, 'click');
  });

  it('should unbind from events', function(done){
    var View = ripple.compile('<div on-click="foo"></div>');
    View.event('foo', function(){
      done(false);
    });
    var view = new View();
    view.unbind();
    trigger(view.el, 'click');
    done();
  });

  it('should rebind to events', function(done){
    var View = ripple.compile('<div on-click="foo"></div>');
    View.event('foo', function(){
      done();
    });
    var view = new View();
    view.unbind();
    view.bind();
    trigger(view.el, 'click');
  });

});