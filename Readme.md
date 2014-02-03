
# events

  Listen for events like click, touch, etc in a template using attributes.

## Installation

  Install with [component(1)](http://component.io):

    $ component install ripplejs/events

## API

A template can use `on-*` to emit events on the view.

```html
<button on-click="save">Save</button>
```

This can be any type of event, eg: `on-dblclick`, `on-touch`, `on-keydown`. The node just needs to emit the event after the `on-` portion of the attribute.

```js
var events = require('events');

// Use the plugin
ripple.use(events);

// Compile the view
var view = ripple.compile(template);

// Listen for the events
view.on('save', this.save);
```

## License

  MIT
