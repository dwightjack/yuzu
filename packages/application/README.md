# yuzu-application <sub>2.0.0-rc.16<sub>

> components management for [yuzu](https://github.com/dwightjack/yuzu/tree/master/packages/yuzu)

Yuzu Application exposes a set of modules aimed to simplify the management of Yuzu components in the context of a page.

> **Available modules:**
>
> - [Context](packages/application/context.md)
> - [Sandbox](packages/application/sandbox.md)

<!-- TOC depthTo:3 -->

- [Installation](#installation)
  - [as NPM package](#as-npm-package)
  - [CDN delivered `<script>`](#cdn-delivered-script)
  - [ES2017 Syntax](#es2017-syntax)
- [Browser support](#browser-support)
- [API Documentation](#api-documentation)

<!-- /TOC -->

## Installation

### as NPM package

```
npm install yuzu yuzu-application --save

# or

yarn add yuzu yuzu-application
```

### CDN delivered `<script>`

Add the following script tags before your code

```html
<script src="https://unpkg.com/yuzu"></script>
<script src="https://unpkg.com/yuzu-application"></script>
```

Yuzu Application will be available in the global scope under `YZ.Application`.

### ES2017 Syntax

To provide maximum compatibility with every development environment, packages are transpiled to ES5. When used with a bundler like [Webpack](https://webpack.js.org/) or [rollup](https://rollupjs.org) the module resolution system will automatically pick either the Commonjs or ESM version based on your configuration.

If you want to import the ES2017 version of a package you can do so by setting an alias on the bundler's configuration file:

#### Webpack

```diff
// webpack.config.js

module.exports = {
  // ...
+  resolve: {
+    alias: {
+      'yuzu-application': 'yuzu-application/dist/index.next.js'
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
+      'yuzu-application': path.resolve(__dirname, 'node_modules/yuzu-application/dist/index.next.js')
+    })
  ],
};
```

## Browser support

Yuzu works in all modern browsers. In order to make it work in browsers that don't support ES2015+ features (like IE11) you need to include the `yuzu-polyfills` package before any other `yuzu*` package.

If you're using a package bundler without any polyfill library like [babel-polyfill](https://babeljs.io/docs/en/babel-polyfill/) add this line at the very top of your entry point:

```js
import 'yuzu-polyfills';
```

## API Documentation

- [Sandbox](packages/application/api/sandbox.md)
- [Context](packages/application/api/context.md)
