var ripple = require('ripple')();
var assert = require('assert');
var each = require('each');

ripple.use(each);

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
    View = ripple.compile('<div each="user,index in users"><div>{{index}} {{user.first}} {{user.last}}</div></div>');
  });

  it('should render a list of items', function(){
    var view = new View({ users: items });
    assert(view.el.children.length === 3);
  })

  it('should add new items', function(){
    var view = new View({ users: items });
    items.push({
      first: 'Bart',
      last: 'Simpson'
    });
    equal(view.el.children.length, 4);
    equal(view.el.children[0].innerHTML, "0 Fred Flintstone");
    equal(view.el.children[1].innerHTML, "1 Barney Rubble");
    equal(view.el.children[2].innerHTML, "2 Homer Simpson");
    equal(view.el.children[3].innerHTML, "3 Bart Simpson");
  })

  it('should remove items', function(){
    var view = new View({ users: items });
    items.pop();
    equal(view.el.children.length, 2);
    equal(view.el.children[0].innerHTML, "0 Fred Flintstone");
    equal(view.el.children[1].innerHTML, "1 Barney Rubble");
  })

  it('should sort items', function(){
    var view = new View({ users: items });
    items.reverse();
    equal(view.el.children[0].innerHTML, "0 Homer Simpson");
    equal(view.el.children[1].innerHTML, "1 Barney Rubble");
    equal(view.el.children[2].innerHTML, "2 Fred Flintstone");
  })

  it('should render a whole new array', function(){
    var view = new View({ users: items });
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
    equal(view.el.children[0].innerHTML, "0 Marty McFly");
    equal(view.el.children[1].innerHTML, "1 Gus Fring");
    equal(view.el.children[2].innerHTML, "2 Walter White");
  })

  it('should render an array of non-objects', function(){
    items = ['foo', 'bar', 'baz'];
    View = ripple.compile('<div each="thing in things"><div>{{thing}}</div></div>');
    var view = new View({ things: items });
    equal(view.el.children[0].innerHTML, "foo");
    equal(view.el.children[1].innerHTML, "bar");
    equal(view.el.children[2].innerHTML, "baz");
  })

});