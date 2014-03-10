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
    View = ripple('<div each="user,index in {{users}}"><div>{{index}} {{user.first}} {{user.last}}</div></div>');
    View.use(each);
  });

  it('should render a list of items', function(done){
    var view = new View();
    view.set('users', items);
    view.mount(document.body);
    dom.defer(function(){
      assert(view.el.children.length === 3);
      view.unmount();
      done();
    });
  })

  it('should add new items', function(done){
    var view = new View();
    view.set('users', items);
    items.push({
      first: 'Bart',
      last: 'Simpson'
    });
    view.mount(document.body);
    dom.defer(function(){
      equal(view.el.children.length, 4);
      equal(view.el.children[0].innerHTML, "0 Fred Flintstone");
      equal(view.el.children[1].innerHTML, "1 Barney Rubble");
      equal(view.el.children[2].innerHTML, "2 Homer Simpson");
      equal(view.el.children[3].innerHTML, "3 Bart Simpson");
      done();
    });
  })

  it('should remove items', function(done){
    var view = new View();
    view.set('users', items);
    view.mount(document.body);
    items.pop();
    dom.defer(function(){
      equal(view.el.children.length, 2);
      equal(view.el.children[0].innerHTML, "0 Fred Flintstone");
      equal(view.el.children[1].innerHTML, "1 Barney Rubble");
      done();
    });
  })

  it('should sort items', function(done){
    var view = new View();
    view.set('users', items);
    view.mount(document.body);
    items.reverse();
    dom.defer(function(){
      equal(view.el.children[0].innerHTML, "0 Homer Simpson");
      equal(view.el.children[1].innerHTML, "1 Barney Rubble");
      equal(view.el.children[2].innerHTML, "2 Fred Flintstone");
      done();
    });
  })

  it('should render a whole new array', function(done){
    var view = new View();
    view.set('users', items);
    view.mount(document.body);
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
      done();
    });
  })

  it('should render an array of non-objects', function(done){
    items = ['foo', 'bar', 'baz'];
    View = ripple('<div each="thing in {{things}}"><div>{{thing}}</div></div>');
    View.use(each);
    var view = new View();
    view.set('things', items);
    view.mount(document.body);
    dom.defer(function(){
      equal(view.el.children[0].innerHTML, "foo");
      equal(view.el.children[1].innerHTML, "bar");
      equal(view.el.children[2].innerHTML, "baz");
      done();
    });
  })

  it.skip('should render with complex expressions', function (done) {
    items = ['foo', 'bar', 'baz'];
    View = ripple('<div each="thing in {{ [things.pop()] } }}"><div>{{thing}}</div></div>');
    View.use(each);
    var view = new View();
    view.set('things', items);
    view.mount(document.body);
    dom.defer(function(){
      equal(view.el.children.length, 1);
      equal(view.el.children[0].innerHTML, "raz");
      done();
    });
  });

});