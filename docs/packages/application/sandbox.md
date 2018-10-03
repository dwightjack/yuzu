# Sandbox

Sandbox creates a hub that groups a set of components within a container DOM element and manages their initialization and lifecyle.

An example scenario might be a panel of your interface where you may place multiple instances of your components, start and stop them while keeping everything separated from other parts of the application.

<!-- TOC depthTo:3 -->

- [Example](#example)
- [Custom options](#custom-options)
- [Inline options](#inline-options)
- [Lifecycle events hooks](#lifecycle-events-hooks)
- [Instance Context](#instance-context)
- [API summary](#api-summary)
  - [Lifecycle methods](#lifecycle-methods)
- [Event bus](#event-bus)
- [API Documentation](#api-documentation)

<!-- /TOC -->

## Example

Suppose we have the following Yuzu components:

```js
class Gallery extends Component {
  static root = '.Gallery';
  // ...
}

class Accordion extends Component {
  static root = '.Accordion';

  static defaultOptions = () => ({
    theme: 'default',
  });
  // ...
}
```

And the following HTML:

```html
<body>
  <div id="app">
    <div class="Gallery">
      <!-- -->
    </div>
    <div class="Accordion">
      <!-- -->
    </div>
    <div class="Accordion">
      <!-- -->
    </div>
  </div>
</body>
```

Without `Sandbox` we'd have to manually query the DOM and initialize a component for each matched element (one `Gallery` and two `Accordion`s).

`Sanbox` will take care of that for us:

```js
const sandbox = new Sandbox({
  root: '#app',
  components: [Gallery, Accordion],
});

sandbox.start();
```

Upon calling `sandbox.start()` the sandbox will query the DOM inside `#app`, match elements based on the components' `.root` static property and initialize matching component on them.

To un-mount the sandbox and it's child components just run `sandbox.stop()`. This will trigger each instance `destroy` method as well.

## Custom options

You can also pass custom properties or CSS matchers for a component in order to alter the default options and element matching selector:

In the following example `Accordion` will be initialized on elements matching `'.myCustomAccordion'` CSS selector.

```js
const sandbox = new Sandbox({
  root: '#app',
  components: [Gallery, [Accordion, { selector: '.myCustomAccordion' }]],
});
```

Every other property added to the object will be passed as instance options at initialization time.

```js
// starts Accordion with the 'dark' theme
const sandbox = new Sandbox({
  root: '#app',
  components: [
    Gallery,
    [Accordion, { selector: '.myCustomAccordion', theme: 'dark' }],
  ],
});
```

## Inline options

Custom options will be used on every component instance in the sandbox. In order to further customize each instance you can set a `data-ui-*` attribute on the component's root element.

Starting from the example above let's change the HTML to:

```diff
<body>
  <div id="app">
    <div class="Gallery">
      <!-- -->
    </div>
    <div class="Accordion">
      <!-- -->
    </div>
-    <div class="Accordion">
+    <div class="Accordion" data-ui-theme="light">
      <!-- -->
    </div>
  </div>
</body>
```

On `sandbox.start()` the first Accordion will be initialized with the `dark` theme, but the second will pick the `light` one.

## Lifecycle events hooks

To interact with a sandbox instance during its lifecycle you can attach event listeners to that instance. Available methods are those provided [dush](https://github.com/tunnckocore/dush).

```js
sandbox.on('start', () => {
  console.log('Sandbox started');
});

sandbox.start();

// will log 'Sandbox started' on start
```

Here below is a table with all available events.

| name          | triggered by | lifecycle phase        |
| ------------- | ------------ | ---------------------- |
| `beforeStart` | `start()`    | startup <sup>(1)</sup> |
| `startup`     | `start()`    | running <sup>(2)</sup> |
| `beforeStop`  | `stop()`     | shutdown               |
| `stop`        | `stop()`     | stopped <sup>(3)</sup> |
| `error`       | `stop()`     | error <sup>(4)</sup>   |

1.  Just before initializing registered components and after `$context` initialization
1.  Instances has been initialized. Since `ready` state can be async there's no guarantee that components' instances are completely initialized at this stage
1.  Instances have been cleared and completely destroyed.
1.  When something fails while shutting down the sandbox an `error` event will be triggered with the error as argument

## Instance Context

The Sandbox's `start` method accepts an object that will be used as data for a shared [context](/packages/application/context) instance attached to the sandbox `$context` property.

?> The sandbox context will be automatically injected into every component instance inside the sandbox. See [context](/packages/application/context) for details.

```js
// starts Accordion with the 'dark' theme
const sandbox = new Sandbox({
  root: '#app',
  components: [Gallery, Accordion],
});

sandbox.start({ theme: 'dark' });

sandbox.$context.getData().theme === 'dark';
```

## API summary

### Lifecycle methods

- `start` Starts the sandbox and initializes matched components
- `stop` (async) Stops the sandbox and calls `destroy` on instantiated components.

## Event bus

- `on`
- `once`
- `off`
- `emit`

See [dush](https://github.com/tunnckocore/dush) for details

## API Documentation

- [Sandbox](/packages/application/api/sandbox)
