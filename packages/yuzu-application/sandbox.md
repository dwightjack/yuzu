# Sandbox

Sandbox is a special component that creates a hub to group a set of components within a container DOM element and manage their initialization and lifecyle.

An example scenario might be a panel of your interface where you place multiple instances of your components, start and stop them while keeping everything separated from other parts of the application.

<!-- TOC depthTo:3 -->

- [Example](#example)
- [Custom Options](#custom-options)
- [Inline Options](#inline-options)
  - [Dynamic selector](#dynamic-selector)
  - [Registering detached component](#registering-detached-component)
  - [Registering mount functions](#registering-mount-functions)
- [Lifecycle Event Hooks](#lifecycle-event-hooks)
- [Instance Context](#instance-context)
- [API Summary](#api-summary)
  - [Lifecycle Methods](#lifecycle-methods)
- [Event Bus](#event-bus)
- [API Documentation](#api-documentation)

<!-- /TOC -->

## Example

Suppose we have the following Yuzu components:

```js
class Timer extends Component {
  static root = '.timer';
  // ...
}

class Counter extends Component {
  static root = '.counter';

  defaultOptions() {
    return {
      // ...
      theme: 'default',
    };
  }

  // ...
}
```

And the following HTML:

```html
<body>
  <div id="app">
    <div class="timer">
      <!-- -->
    </div>
    <div class="counter">
      <!-- -->
    </div>
    <div class="counter">
      <!-- -->
    </div>
  </div>
</body>
```

Without `Sandbox` we'd have to manually query the DOM and initialize a component for each matched element (one `Timer` and two `Counter`s).

`Sandbox` will take care of that for us:

```js
import { Sandbox } from 'yuzu-application';

const sandbox = new Sandbox({
  components: [Timer, Counter],
}).mount('#app');
```

<iframe src="https://codesandbox.io/embed/yuzu-demo-m1v2m?autoresize=1&fontsize=14&initialpath=%2Fexamples%2Fsandbox%2Fbase%2Findex.html&module=%2Fexamples%2Fsandbox%2Fbase%2Findex.js&view=preview" title="Yuzu Demo" allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

Upon calling `sandbox.mount('#app')` the sandbox will query the DOM inside `#app`, match elements based on each components' `.root` static property and initialize matching component on them.

To un-mount the sandbox and its child components just run `sandbox.destroy()`. This will trigger each instance `destroy` method as well.

?> To prevent a component for being initialized (for example when you want to initialize it at a later moment) just add a `data-skip` attribute to it's root element.

## Custom Options

You can also pass custom properties or CSS matchers for a component in order to alter the default options and element matching selector:

In the following example `Counter` will be initialized on elements matching the `'.my-custom-counter'` CSS selector.

```js
const sandbox = new Sandbox({
  components: [Timer, [Counter, { selector: '.my-custom-counter' }]],
});
```

Every other property added to the object will be passed as instance option at initialization time.

```js
// starts the counter with the 'dark' theme
const sandbox = new Sandbox({
  components: [Timer, [Counter, { theme: 'dark' }]],
});
```

## Inline Options

Custom options will be used on every component instance in the sandbox. In order to further customize each instance you can set a `data-ui-*` attribute on the component's root element.

Starting from the example above let's change the HTML to:

```diff
<body>
  <div id="app">
    <div class="timer">
      <!-- -->
    </div>
    <div class="counter">
      <!-- -->
    </div>
-    <div class="counter">
+    <div class="counter" data-ui-theme="light">
      <!-- -->
    </div>
  </div>
</body>
```

On `sandbox.mount([root])` the first Counter will be initialized with the `dark` theme, but the second will pick the `light` one.

<iframe src="https://codesandbox.io/embed/yuzu-demo-m1v2m?autoresize=1&fontsize=14&initialpath=%2Fexamples%2Fsandbox%2Fwithoptions%2Findex.html&view=preview" title="Yuzu Demo" allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

### Dynamic selector

Custom selector options can be either a string or a function. In the latter case the function will receive the sandbox instance as first argument and must return a new selector string or a list of DOM elements:

```js
const sandbox = new Sandbox({
  components: [
    [Counter, { selector: (sbx) => sbx.findNodes('.my-custom-counter') }],
  ],
});
```

### Registering detached component

To register a detached component you must provide a selector function. The sandbox will initialize an instance of the component if the selector function returns `true`:

```js
const sandbox = new Sandbox({
  // always initialize an instance of MyDetachedComponent
  components: [[MyDetachedComponent, { selector: () => true }]],
});
```

### Registering mount functions

By design components trees created with [`mount`](packages/yuzu/api/mount) cannot be registered on a sandbox because they serve different purposes: `Sandbox` matches a list of components against an unknown HTML document while `mount` describes a pre-determined tree of components within a known HTML.

Anyway, there are scenarios when you'd want to use a mount tree inside a sandbox.
For example let's say you have a site-wide header described by a `mount` function and want to use it in a sandbox attached to `document.body`.

In this case you can use a [`DetachedComponent`](/packages/yuzu/#detached-components) as _connector_ between the two.

```js
import { DetachedComponent, mount } from 'yuzu';
import { Sandbox } from 'yuzu-application';
import { MobileNavigation } from './MobileNavigation';
import { MegaMenu } from './MegaMenu';
import { Header } from './Header';

const headerTree = mount(Header, '.header', {}, [
  mount(MegaMenu, '.header__menu'),
  mount(MobileNavigation, '.header__mobile-nav'),
]);

class HeaderConnector extends DetachedComponent {
  initialize() {
    headerTree(this);
  }
}

const sandbox = new Sandbox({
  components: [[HeaderConnector, { selector: () => true }]],
}).mount(document.body);
```

The resulting component tree will be:

```
<Sandbox>
  <HeaderConnector>
    <Header>
      <MegaMenu />
      <MobileNavigation />
    </Header>
  </HeaderConnector>
</Sandbox>
```

## Lifecycle Event Hooks

To interact with a sandbox instance during its lifecycle you can attach event listeners to that instance. Available methods are those provided by [dush](https://github.com/tunnckocore/dush).

```js
sandbox.on('start', () => {
  console.log('Sandbox started');
});

sandbox.mount(document.body);

// will log 'Sandbox started' on mount
```

Here below is a table with all available events.

| name          | triggered by | lifecycle phase        |
| ------------- | ------------ | ---------------------- |
| `beforeStart` | `mount()`    | startup <sup>(1)</sup> |
| `start`       | `mount()`    | running <sup>(2)</sup> |
| `beforeStop`  | `destroy()`  | shutdown               |
| `stop`        | `destroy()`  | stopped <sup>(3)</sup> |
| `error`       | `destroy()`  | error <sup>(4)</sup>   |

1.  Just before initializing registered components and after `$ctx` initialization.
1.  Instances has been initialized. Since `ready` state can be async there's no guarantee that components' instances are completely initialized at this stage.
1.  Instances have been cleared and completely destroyed.
1.  When something fails while shutting down the sandbox an `error` event will be triggered with the error as argument.

## Instance Context

You can setup a [context](/packages/application/context) onto the Sandbox instance. The context will be attached to the sandbox `$ctx` property.

?> The sandbox context will be automatically injected into every component instance inside the sandbox. See [context](/packages/application/context) for details.

```js
import { createContext, Sandbox } from 'yuzu-application';

// shared sandbox theme
const sandbox = new Sandbox({
  context: createContext({ theme: 'dark' }),
  components: [Timer, Counter],
}).mount(document.body);

sandbox.$ctx.getData().theme === 'dark';

// inside a component use this.$context.theme
```

## API Summary

### Lifecycle Methods

- `mount` Enhances the default `Component` mount method by starting the sandbox and initializing matched components
- `destroy` (async) Stops the sandbox and calls `destroy` on instantiated components

## Event Bus

- `on`
- `once`
- `off`
- `emit`

See [Events](/packages/utils/api/events) for details.

## API Documentation

- [Sandbox](/packages/application/api/sandbox)
