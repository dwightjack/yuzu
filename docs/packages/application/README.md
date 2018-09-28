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
- [Sandbox](#sandbox)
  - [Custom options](#custom-options)
  - [Inline options](#inline-options)
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

## Sandbox

Sandbox creates a hub that groups a set of components within a DOM element and manages their initialization and lifecyle.

An example scenario might be a panel of your interface where you may place multiple instances of your components, start and stop them while keeping everything separated from other parts of the application.

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

Without `Sandbox` we'd have to manually query the DOM and initialize a component for each matched element (a `Gallery` and two `Accordion`s).

`Sanbox` will take care of that for us

```js
const sandbox = new Sandbox({
  root: '#app',
  components: [Gallery, Accordion],
});

sandbox.start();
```

On calling `sandbox.start()` the sandbox will query the DOM inside `#app`, match elements based on the components' `.root` static property and initialize the matching component on them.

To un-mount the sandbox and it's child components just run `sandbox.stop()`. This will trigger each instance `destroy()` method as well.

### Custom options

You can also pass custom properties or CSS matchers for a component in order to alter the default options and element matching selector:

In the following example `Accordion` will be initialized on elements matching `'.myCustomAccordion'` CSS selector.

```js
const sandbox = new Sandbox({
  root: '#app',
  components: [Gallery, [Accordion, { selector: '.myCustomAccordion' }]],
});
```

Every other property added to the object will be passed as component options at initialization time.

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

Custom options will be used on every instance found in the sandbox. In order to further customize each instance you can set a `data-ui-*` attribute on the component's root element.

Starting from the example let's change the HTML to:

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

On `sandbox.start()` the first Accordion will be initialized with `dark` theme, but the second will pick the `light` one.

### API summary

#### Lifecycle methods

- `start` Starts the sandbox and initialized matched components
- `stops` Stops the sandbox and calls `destroy()` on instantiated components

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
