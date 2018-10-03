# @yuzu/loadable

> Async component initializer for [@yuzu/core](https://github.com/dwightjack/yuzu/tree/master/packages/core)

Yuzu components rely on pre-existing HTML used as baseline to enhance the user experience.

But in some scenarios the HTML you need is not rendered, or you have to deal with data from a remote JSON API.

This is where **Yuzu Loadable** comes in hand.

Yuzu Loadable lets you define an async function call and use its returned data to instantiate a component and its HTML template.

<!-- TOC depthTo:3 -->

- [Installation](#installation)
  - [as NPM package](#as-npm-package)
  - [CDN delivered `<script>`](#cdn-delivered-script)
  - [ES2017 Syntax](#es2017-syntax)
- [Browser support](#browser-support)
- [Basic usage](#basic-usage)
- [Showing a Loader](#showing-a-loader)

<!-- /TOC -->

## Installation

### as NPM package

```
npm install @yuzu/core @yuzu/loadable --save

# or

yarn add @yuzu/core @yuzu/loadable
```

### CDN delivered `<script>`

add the following script tags before your code

```html
<script src="https://unpkg.com/dush/dist/dush.umd.js"></script>
<script src="https://unpkg.com/@yuzu/core"></script>
<script src="https://unpkg.com/@yuzu/loadable"></script>
```

Yuzu Loadable will be available in the global scope under `YZ.Loadable`.

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
+      '@yuzu/loadable': '@yuzu/loadable/dist/index.next.js'
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
+      '@yuzu/loadable': path.resolve(__dirname, 'node_modules/@yuzu/loadable/dist/index.next.js')
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

## Basic usage

Let's imagine you have a component `UsersOnline` that renders the number of user online reading that data from a remove endpoint.

Here are the HTML and the component for `UsersOnline`:

```html
<div class="UsersOnline"></div>
```

```js
// UsersOnline.js
import { Component } from '@yuzu/core';

export class UsersOnline extends Component {
  state = { count: 0 };

  actions = {
    count: 'update',
  };

  update() {
    this.$el.innerText = `Users online: ${this.state.count}`;
  }
}
```

To convert `UsersOnline` to an async component let's use `Loadable`:

```js
// AsyncUsersOnline.js
import { Loadable } from '@yuzu/loadable';
import UsersOnline from './UsersOnline';

const getUsers = () => {
  // /api/users-live returns an object like { count: 35 }
  return fetch('/api/users-live').then((response) => response.json());
};

const AsyncUsersOnline = Loadable({
  component: UsersOnline,
  fetchData: getUsers,
});

const users = new AsyncUsersOnline().mount('.UsersOnline');
```

`AsyncUsersOnline` will first execute `getUsers`. When the promise returned by fetch resolves it will initialize `UsersOnline` with the returned value and mount it onto a child `div` element it created inside `.UsersOnline`.

The resulting HTML will look like:

```html
<div class="UsersOnline">
  <div>Users online: 35</div>
</div>
```

## Showing a Loader

As a User Experience best practice, while loading data you should show a loader indicator to communicate to the user that something is going on.

To define a loader for the loadable component use the `loader` options:

```js
// Loader.js
import { Component } from '@yuzu/core';

export class Loader extends Component {
  mounted() {
    this.$el.innerText = 'loading';
  }
}
```

```diff
+ import Loader from './Loader';

const AsyncUsersOnline = Loadable({
  component: UsersOnline,
  fetchData: getUsers,
+ loader:Loader
});
```

The `Loader` component will be shown while data are loading and will be [replaced](/packages/core/#child-component-replacement)
