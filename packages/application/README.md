# @yuzu/application

> Components management for [@yuzu/core](https://github.com/dwightjack/yuzu/tree/master/packages/core)

Yuzu Application exposes a set of modules aimed to simplify the instantiation of Yuzu components in the context of a page.

Available modules:

- [`Sandbox`](#sandbox):
- [`Context`](#context):

<!-- TOC depthTo:3 -->

- [Installation](#installation)
  - [as NPM package](#as-npm-package)
  - [CDN delivered `<script>`](#cdn-delivered-script)
  - [ES2017 Syntax](#es2017-syntax)
- [Browser support](#browser-support)
- [Context](#context)
  - [Example](#example)
  - [Data management](#data-management)
  - [Context vs Store](#context-vs-store)
- [Sandbox](#sandbox)
  - [Example](#example-1)
  - [Custom options](#custom-options)
  - [Inline options](#inline-options)
  - [Lifecycle events hooks](#lifecycle-events-hooks)
  - [API summary](#api-summary)
  - [Event bus](#event-bus)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)

<!-- /TOC -->

## Installation

### as NPM package

```
npm install @yuzu/core @yuzu/application --save

# or

yarn add @yuzu/core @yuzu/application
```

### CDN delivered `<script>`

add the following script tags before your code

```html
<script src="https://unpkg.com/dush/dist/dush.umd.js"></script>
<script src="https://unpkg.com/@yuzu/core"></script>
<script src="https://unpkg.com/@yuzu/application"></script>
```

Yuzu application will be available in the global scope under `YZ.Application`.

### ES2017 Syntax

To provide maximum compatibility with every development environment, packages are transpiled to ES5. When used with a bundler like Webpack or rollup the module resolution system will automatically pick either the Commonjs or ESM version based on your configuration.

If you want to import the ES2017 version of a package you can do so by setting an alias on the bundler's configuration file:

#### Webpack

```diff
// webpack.config.js

module.exports = {
  // ...
+  resolve: {
+    alias: {
+      '@yuzu/application': '@yuzu/application/dist/index.next.js'
+    }
+  }
}
```

#### Rollup

Use [rollup-plugin-alias](https://github.com/rollup/rollup-plugin-alias)

```diff
// rollup.config.js
+ import path from 'path';
+ import alias from 'rollup-plugin-alias';

export default {
  input: './src/index.js',
  plugins: [
    // ...
+    alias({
+      '@yuzu/application': path.resolve(__dirname, 'node_modules/@yuzu/application/dist/index.next.js')
+    })
  ],
};
```

## Browser support

Yuzu works in all modern browsers. In order to make it work in browsers that don't support ES2015+ features (like IE11) you need to include the `@yuzu/polyfills` package before any other `@yuzu/*` package.

If you're using a package bundler without any polyfill library like [babel-polyfill](https://babeljs.io/docs/en/babel-polyfill/) add this line at the very top of your entrypoint:

```js
import '@yuzu/polyfills';
```

## Context

A context is an object you can inject into a component instance.

You can inject the same context into multiple instances thus sharing its contents and methods.

After the injection the context will be available inside the component through a `$context` property.

?> Child components registered with `setRef` will inherit the parent `$context` property.

### Example

The most common usage scenario for Context is sharing data among a group of components by _injecting_ it into each instance:

```js
import { Component } from '@yuzu/core';
import { createContext } from '@yuzu/application';

const one = new Component();
const two = new Component();

// create a new context
const context = createContext({
  theme: 'dark',
});

// inject it into the dummy components
context.inject(one);
context.inject(two);

console.log(one.$context.theme); // logs 'dark'

// $context data are shared between instances
one.$context.theme === one.$context.theme;
```

### Data management

#### Read

To retrieve data stored into the context use the `getData` method:

```js
const context = createContext({
  theme: 'dark',
});

const data = context.getData();

data.theme === 'dark';
```

?> Inside a component, context's data are available directly from `$context`.

#### Updates

To update a context's data, you can use the `update` method:

```js
const context = createContext({
  theme: 'dark',
});

context.update({ theme: 'light' });

context.getData().theme === 'light';
```

!> By design components are not allowed to directly update a context.

### Context vs Store

Context is meant to be used as an entry point for sharable data. This means there is no update tracking system nor any flux-like pattern to be applied.

In order to implement a shared store you could leverage a library like [Redux](https://redux.js.org/) or [unistore](https://www.npmjs.com/package/unistore) and attach the store instance to a context:

```js
import { Component } from '@yuzu/core';
import { createContext } from '@yuzu/application';
import createStore from 'unistore';

const instance = new Component();

const store = createStore({ theme: 'dark' });
const context = createContext({ store });

context.inject(instance);

//access store state
instance.$context.store.getState().theme === 'dark';

// react to store updates
instance.$context.store.subscribe((state) => {
  // ...
});
```

## Sandbox

Sandbox creates a hub that groups a set of components within a container DOM element and manages their initialization and lifecyle.

An example scenario might be a panel of your interface where you may place multiple instances of your components, start and stop them while keeping everything separated from other parts of the application.

### Example

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

### Custom options

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

### Inline options

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

### Lifecycle events hooks

To interact with a sandbox instance during its lifecycle you can attach event listeners to that instance. Available methods are those provided [dush](https://github.com/tunnckocore/dush).

```js
sandbox.on('start', () => {
  console.log('Sandbox started');
});

sandbox.start();

// will log 'Sandbox started' on start
```

Here below is a table with all available events

| name          | triggered by | lifecycle phase |
| ------------- | ------------ | --------------- |
| `beforeStart` | `start()`    | startup (1)     |
| `startup`     | `start()`    | running (2)     |
| `beforeStop`  | `stop()`     | shutdown        |
| `stop`        | `stop()`     | stopped (3)     |
| `error`       | `stop()`     | error (4)       |

1.  Just before initializing registered components and after `$context` initialization
1.  Instances has been initialized. Since `ready` state can be async there's no guarantee that components' instances are completely initialized at this stage
1.  Instances have been cleared and completely destroyed.
1.  When something fails while shutting down the sandbox an `error` event will be triggered with the error as argument

### API summary

#### Lifecycle methods

- `start` Starts the sandbox and initializes matched components
- `stop` (async) Stops the sandbox and calls `destroy` on instantiated components.

### Event bus

- `on`
- `once`
- `off`
- `emit`

See [dush](https://github.com/tunnckocore/dush) for details

## API Documentation

- [Sandbox](doc/sandbox.md)
- [Context](doc/context.md)

## Contributing

1.  Fork it or clone the repo
1.  Install dependencies `yarn install`
1.  Code your changes and write new tests in the `test` folder.
1.  Ensure everything is fine by running `yarn build`
1.  Push it or submit a pull request :D
