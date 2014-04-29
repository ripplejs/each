var ripple = require('ripple');
var assert = require('assert');
var each = require('each');
var dom = require('fastdom');
var assertions = 0;

function equal(one, two) {
  assertions += 1;
  assert(one === two, ['#'+assertions, one, two].join(' | '));
}

describe('each', function(){
  var items, View;

  beforeEach(function(){
    assertions = 0;
    items = [{
      first: 'Fred',
      last: 'Flintstone'
    }, {
      first: 'Barney',
      last: 'Rubble'
    }, {
      first: 'Homer',
      last: 'Simpson'
    }];
    View = ripple('<div each="{{users}}"><div>{{$index}} {{first}} {{last}}</div></div>');
    View.use(each);
  });

  it('should render a list of items', function(){
    var view = new View({
      data: {
        users: items
      }
    });
    view.appendTo(document.body);
    assert(view.el.children.length === 3);
    view.destroy();
  })

  it('should render data from the parent scope', function(done){
    var Parent = ripple('<div></div>');
    var View = ripple('<div each="{{users}}">{{foo}}</div>');
    View.use(each);
    var parent = new Parent({
      data: {
        foo: 'bar'
      }
    });
    var view = new View({
      scope: parent,
      data: {
        users: items
      }
    });
    view.appendTo(document.body);
    dom.defer(function(){
      assert(view.el.innerHTML === 'barbarbar');
      view.destroy();
      done();
    });
  });

  it('should update rendered data from the parent scope', function(done){
    var Parent = ripple('<div></div>');
    var View = ripple('<div each="{{users}}">{{foo}}</div>');
    View.use(each);
    var parent = new Parent({
      data: {
        foo: 'bar'
      }
    });
    var view = new View({
      scope: parent,
      data: {
        users: items
      }
    });
    view.appendTo(document.body);
    parent.set('foo', 'baz');
    dom.defer(function(){
      assert(view.el.innerHTML === 'bazbazbaz');
      view.destroy();
      done();
    });
  });

  it('should add new items', function(){
    var view = new View({
      data: {
        users: items
      }
    });
    items.push({
      first: 'Bart',
      last: 'Simpson'
    });
    view.appendTo(document.body);
    equal(view.el.children.length, 4);
    equal(view.el.children[0].innerHTML, "0 Fred Flintstone");
    equal(view.el.children[1].innerHTML, "1 Barney Rubble");
    equal(view.el.children[2].innerHTML, "2 Homer Simpson");
    equal(view.el.children[3].innerHTML, "3 Bart Simpson");
    view.destroy();
  })

  it('should remove items', function(done){
    var view = new View({
      data: {
        users: items
      }
    });
    view.appendTo(document.body);
    items.pop();
    equal(view.el.children.length, 2);
    equal(view.el.children[0].innerHTML, "0 Fred Flintstone");
    equal(view.el.children[1].innerHTML, "1 Barney Rubble");
    view.destroy();
    done();
  })

  it('should sort items', function(done){
    var view = new View({
      data: {
        users: items
      }
    });
    view.appendTo(document.body);
    items.reverse();
    dom.defer(function(){
      equal(view.el.children[0].innerHTML, "0 Homer Simpson");
      equal(view.el.children[1].innerHTML, "1 Barney Rubble");
      equal(view.el.children[2].innerHTML, "2 Fred Flintstone");
      view.destroy();
      done();
    });
  })

  it('should render a whole new array', function(done){
    var view = new View({
      data: {
        users: items
      }
    });
    view.appendTo(document.body);
    view.set('users', [{
      first: 'Marty',
      last: 'McFly'
    }, {
      first: 'Gus',
      last: 'Fring'
    }, {
      first: 'Walter',
      last: 'White'
    }]);
    dom.defer(function(){
      equal(view.el.children[0].innerHTML, "0 Marty McFly");
      equal(view.el.children[1].innerHTML, "1 Gus Fring");
      equal(view.el.children[2].innerHTML, "2 Walter White");
      view.destroy();
      done();
    });
  })

  it('should render an array of non-objects', function(done){
    items = ['foo', 'bar', 'baz'];
    View = ripple('<div each="{{things}}"><div>{{$value}}</div></div>');
    View.use(each);
    var view = new View({
      data: {
        things: items
      }
    });
    view.appendTo(document.body);
    dom.defer(function(){
      equal(view.el.children[0].innerHTML, "foo");
      equal(view.el.children[1].innerHTML, "bar");
      equal(view.el.children[2].innerHTML, "baz");
      view.destroy();
      done();
    });
  });

  it('should not call lifecycle methods on child views', function () {
    var i = 0;
    View.created(function(){
      i++;
    });
    var view = new View({
      data: {
        users: items
      }
    });
    view.appendTo(document.body);
    assert(view.el.children.length === 3);
    view.destroy();
    assert(i === 1);
  });

  it('should render items passed down from the parent', function (done) {
    var Parent = ripple('<div><child items="{{items}}"></child></div>');
    var Child = ripple('<ul each="{{items}}"><li>{{name}}</li></ul>');
    Child.use(each);
    Parent.compose('child', Child);
    var parent = new Parent({
      data: {
        items: [
          { name: 'One' },
          { name: 'Two' },
          { name: 'Three' }
        ]
      }
    });
    assert(parent.el.querySelectorAll('ul').length > 0, 'should have a ul');
    assert(parent.el.querySelectorAll('li').length === 3);
    assert(parent.el.querySelectorAll('li')[0].innerHTML === 'One');
    assert(parent.el.querySelectorAll('li')[1].innerHTML === 'Two');
    assert(parent.el.querySelectorAll('li')[2].innerHTML === 'Three');
    done();
  });

});