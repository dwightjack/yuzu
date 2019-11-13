# yuzu-utils

> utility functions for the [yuzu](https://github.com/dwightjack/yuzu/) library ecosystem

<!-- TOC depthTo:3 -->

- [Installation](#installation)
  - [As NPM Package](#as-npm-package)
  - [CDN Delivered `<script>`](#cdn-delivered-script)
  - [ES2017 Syntax](#es2017-syntax)
- [Browser Support](#browser-support)
- [Documentation](#documentation)
- [Contributing](#contributing)

<!-- /TOC -->

## Installation

### As NPM Package

```
npm install yuzu-utils --save

# or

yarn add yuzu-utils
```

### CDN Delivered `<script>`

Add the following script tag before your code

```html
<script src="https://unpkg.com/yuzu-utils"></script>
```

Yuzu utils will be available in the global scope under `YZ.Utils`.

**Note** The UMD build of yuzu already ships with built-in utils under the `YZ.Utils` namespace.

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
+      'yuzu-utils': 'yuzu-utils/dist/index.next.js'
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
+      'yuzu-utils': path.resolve(__dirname, 'node_modules/yuzu-utils/dist/index.next.js')
+    })
  ],
};
```

## Browser Support

Yuzu works in all modern browsers. In order to make it work in browsers that don't support ES2015+ features (like IE11) you need to include the `yuzu-polyfills` package before any other `yuzu*` package.

If you're using a package bundler add this line at the very top of your entry point:

```js
import 'yuzu-polyfills';
```

## Documentation

Learn more about Yuzu utils! Browse **[the API](https://dwightjack.github.io/yuzu/#/packages/utils/api/index)**.

## Contributing

1.  Fork it or clone the repo
1.  Install dependencies `yarn install`
1.  Code your changes and write new tests in the `test` folder.
1.  Ensure everything is fine by running `yarn build`
1.  Push it or submit a pull request :D
