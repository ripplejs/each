# each

[![Build Status](https://travis-ci.org/ripplejs/each.png?branch=master)](https://travis-ci.org/ripplejs/each)

  Allows iteration in templates. 
  
  **Works with ripple <=0.4.0. The ripplejs/list plugin will handle lists in a better way for 0.5.0 onwards.**


## Installation

  Install with [component(1)](http://component.io):

    $ component install ripplejs/each

## API


```html
<div each="{{users}}">
  Index: {{$index}}
  <img src="{{avatar}}" />
  {{name}}
</div>
```


## License

  MIT
