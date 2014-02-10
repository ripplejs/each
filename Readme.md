
# each

[![Build Status](https://travis-ci.org/ripplejs/each.png?branch=master)](https://travis-ci.org/ripplejs/each)

  Allows iteration in templates

## Installation

  Install with [component(1)](http://component.io):

    $ component install ripplejs/each

## API

With optional index property:

```html
<div each="user,index in users">
  Index: {{index}}
  <img src="{{user.avatar}}" />
  {{ user.name }}
</div>
```

Without index:

```html
<div each="user in users">
  <img src="{{user.avatar}}" />
  {{ user.name }}
</div>
```

## License

  MIT
