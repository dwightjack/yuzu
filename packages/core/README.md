# @yuzu/core

> old school component management

Manage your HTML based components in style with progressive enhancement.

<!-- TOC depthTo:3 -->

- [Installation](#installation)
  - [As NPM Package](#as-npm-package)
  - [CDN Delivered `<script>`](#cdn-delivered-script)
  - [ES2017 Syntax](#es2017-syntax)
- [Browser Support](#browser-support)
- [Example](#example)
- [Documentation](#documentation)
- [Contributing](#contributing)

<!-- /TOC -->

## Installation

### As NPM Package

```
npm install @yuzu/core --save

# or

yarn add @yuzu/core
```

### CDN Delivered `<script>`

add the following script tags before your code

```html
<script src="https://unpkg.com/dush/dist/dush.umd.js"></script>
<script src="https://unpkg.com/@yuzu/core"></script>
```

Yuzu modules will be available in the global scope under the `YZ` namespace (`YZ.Component`, `YZ.mount`, etc...)

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
+      '@yuzu/core': '@yuzu/core/dist/index.next.js'
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
+      '@yuzu/core': path.resolve(__dirname, 'node_modules/@yuzu/core/dist/index.next.js')
+    })
  ],
};
```

## Browser Support

Yuzu works in all modern browsers. In order to make it work in browsers that don't support ES2015+ features (like IE11) you need to include the `@yuzu/polyfills` package before any other `@yuzu/*` package.

If you're using a package bundler without any polyfill library like [babel-polyfill](https://babeljs.io/docs/en/babel-polyfill/) add this line at the very top of your entrypoint:

```js
import '@yuzu/polyfills';
```

## Example

```html
<div class="Counter"></div>
```

```js
import { Component } from '@yuzu/core';

class Counter extends Component {
  state = { count: 0 };
  actions = {
    count(value) {
      this.$el.innerText = value;
    },
  };

  mounted() {
    this.interval = setInterval(() => {
      this.setState(({ count }) => ({
        count: count + 1,
      }));
    }, 1000);
  }

  beforeDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
}
```

## Documentation

Learn more about Yuzu! Read the **[full documentation](#/packages/core)** or **[browse the API](#/packages/api/core)**.

## Contributing

1.  Fork it or clone the repo
1.  Install dependencies `yarn install`
1.  Code your changes and write new tests in the `test` folder.
1.  Ensure everything is fine by running `yarn build`
1.  Push it or submit a pull request :D
