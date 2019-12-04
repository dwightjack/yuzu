# yuzu-loadable

> Async component initializer for [yuzu](https://github.com/dwightjack/yuzu/tree/master/packages/yuzu)

Yuzu components rely on pre-existing HTML used as baseline to enhance the user experience.

But in some scenarios the HTML you need is not rendered, or you have to wait for data coming from a remote API before you can initialize a component.

This is where **Yuzu Loadable** comes in hand.

Yuzu Loadable lets you define an async function and use its returned data to instantiate a component and its HTML template.

<!-- TOC depthTo:3 -->

- [Installation](#installation)
  - [As NPM Package](#as-npm-package)
  - [CDN Delivered `<script>`](#cdn-delivered-script)
  - [ES2017 Syntax](#es2017-syntax)
- [Browser Support](#browser-support)
- [Key Concepts](#key-concepts)
- [Basic Usage](#basic-usage)
- [Options Override](#options-override)
- [Showing a Loader](#showing-a-loader)
- [Custom Render Root](#custom-render-root)
- [Component Template](#component-template)
- [Component State](#component-state)
- [Component Options](#component-options)
- [API Documentation](#api-documentation)

<!-- /TOC -->

## Installation

### As NPM Package

```
npm install yuzu yuzu-loadable --save

# or

yarn add yuzu yuzu-loadable
```

### CDN Delivered `<script>`

Add the following script tags before your code

```html
<script src="https://unpkg.com/yuzu"></script>
<script src="https://unpkg.com/yuzu-loadable"></script>
```

Yuzu Loadable will be available in the global scope under `YZ.Loadable`.

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
+      'yuzu-loadable': 'yuzu-loadable/dist/index.next.js'
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
+      'yuzu-loadable': path.resolve(__dirname, 'node_modules/yuzu-loadable/dist/index.next.js')
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

## Key Concepts

`Loadable` comprises some key concepts:

- The **`Loadable` factory** function itself
- An **outlet component** returned by the factory function
- A **rendered component** assigned to the `component` option of the factory
- An optional **loader component**

Let's start getting this concepts sorted.

## Basic Usage

Let's imagine you have a component called `UsersOnline` that renders the number of online users reading that data from a remove API endpoint.

Here are the HTML and component class for `UsersOnline`:

```html
<div class="users-online"></div>
```

```js
// UsersOnline.js
import { Component } from 'yuzu';

export class UsersOnline extends Component {
  defaultOptions() {
    return {
      label: 'Users online:',
    };
  }

  state = { count: 0 };

  actions = {
    count: 'update',
  };

  update() {
    const { label } = this.options;
    this.$el.innerText = `${label} ${this.state.count}`;
  }
}
```

To use `UsersOnline` asynchronously we assign it to the `component` option of a `Loadable` configuration object. We need to define a function to load the remote data as well:

```js
// AsyncUsersOnline.js
import { Loadable } from 'yuzu-loadable';
import UsersOnline from './UsersOnline';

const getUsers = () => {
  // /api/users-live returns an object like { count: 35 }
  return fetch('/api/users-live').then((response) => response.json());
};

const AsyncUsersOnline = Loadable({
  component: UsersOnline,
  fetchData: getUsers,
});

const users = new AsyncUsersOnline().mount('.users-online');
```

`AsyncUsersOnline` is an **outlet component**. When mounted it will:

1. execute `getUsers`
1. wait for the promise returned by `fetch` to resolve or reject
1. initialize the rendered component `UsersOnline` with the promise's returned value
1. mount it onto a child `div` element it created inside `.users-online`.

The resulting HTML will look like:

```html
<div class="users-online">
  <div>Users online: 35</div>
</div>
```

## Options Override

Each outlet component accepts the same configuration options that you can pass to `Loadable`.

This gives you the ability to finely control every instance of an outlet component.

For example if we'd want to show another user count but with data fetched from a different source, we could define a custom `fetchData` option at instantiation time:

```js
// ...

const users = new AsyncUsersOnline().mount('.users-online');

const getUsersAlt = () => {
  return fetch('/api/v2/users-live').then((response) => response.json());
};

const altUsers = new AsyncUsersOnline({
  fetchData: getUsersAlt,
}).mount('.users-online');
```

## Showing a Loader

As User Experience best practice, while fetching data you should show a loader indicator to communicate to the user that something is going on.

To define a loader for the outlet component use the `loader` options:

```js
// Loader.js
import { Component } from 'yuzu';

export class Loader extends Component {
  mounted() {
    this.$el.innerText = 'loading...';
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

The `Loader` component will be shown while `getUsers` is executing and will then be [replaced](/packages/yuzu/#child-component-replacement) by the rendered component.

## Custom Render Root

The child element used as root for both the loader and rendered component is called the **render root**. It will be dynamically created when the outlet component gets mounted.

By default the render root is a `div` element, but you might want to customize it.

This can be achieved by defining a `renderRoot` configuration property:

```diff
const AsyncUsersOnline = Loadable({
  component: UsersOnline,
  fetchData: getUsers,
+ renderRoot: 'p'
});
```

The resulting HTML will look like:

```html
<div class="users-online">
  <p>Users online: 35</p>
</div>
```

If you need more control over the element than just choosing its tag name, you can pass a function returning a DOM element. The function will receive the outlet component's root element as parameter:

```diff
const AsyncUsersOnline = Loadable({
  component: UsersOnline,
  fetchData: getUsers,
+ renderRoot: ($el) => {
+   const root = document.createElement('p');
+   root.classList.add(`${$el.className}__root`);
+   return root;
+ }
});
```

Resulting in the following HTML:

```html
<div class="users-online">
  <p class="users-online__root">Users online: 35</p>
</div>
```

## Component Template

In a real world application a component could have a rather complex HTML structure. Since the Loadable root does not allow inner nodes, you can use the `template` option to dynamically render you component's HTML.

`template` should be a function that returns a string of HTML. It receives an object containing `state.props` and `options` of the outlet component.

Let's modify the code accordingly:

```diff
// UsersOnline.js
import { Component } from 'yuzu';

export class UsersOnline extends Component {
  defaultOptions() {
    return {
      label: 'Users online:',
    };
  }

  state = { count: 0 };

  actions = {
    count: 'update',
  };

+ selectors = {
+   value: '.users-online__value > p'
+ }

  update() {
    const { label } = this.options;
-   this.$el.innerText = `${label} ${this.state.count}`;
+   this.$els.value.innerText = `${label} ${this.state.count}`;
  }
}
```

```diff
import Loader from './Loader';

+ const renderHTML = ({ props, options }) =>
+   `<div class="users-online__value">
+     <p>${options.label} ${props.count}</p>
+   </div>`;

const AsyncUsersOnline = Loadable({
  component: UsersOnline,
  fetchData: getUsers,
  loader:Loader
+ template: renderHTML
});
```

The HTML returned by the template will **replace the render root** resulting in something like:

```html
<div class="users-online">
  <div class="users-online__value">
    <p>Users online: 35</p>
  </div>
</div>
```

Hit the _refresh_ button to see the example in action.

<iframe src="https://codesandbox.io/embed/yuzu-demo-m1v2m?autoresize=1&fontsize=14&initialpath=%2Fexamples%2Floadable%2Findex.html&module=%2Fexamples%2Floadable%2Findex.js&view=preview" title="Yuzu Demo" allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

?> For simple templates ES6 [Template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) are a fast end easy option. For more complex templates consider using something like [**lodash templates**](https://lodash.com/docs/4.17.10#template) or [**handlebars**](http://handlebarsjs.com/).

!> The template must contain a **single root element**. If a template returns multiple root elements, just the first one will be injected into the DOM.

## Component State

By default the rendered component receives the data returned by the dataFetch function as initial state.

To provide a custom initial state to the rendered component you can define a `props` option on the configuration object:

```diff
const AsyncUsersOnline = Loadable({
  component: UsersOnline,
  fetchData: getUsers,
+ props: { count: 100 }
});
```

Since the rendered component is actually a **child component** of the outlet component, you can leverage the [**computed state**](/packages/yuzu/component/#child-components-initial-state-and-computed-state) feature in order to compute the component's state.

?> To access the data returned by the `fetchData` function read the `state.props` property.

```diff
const AsyncUsersOnline = Loadable({
  component: UsersOnline,
  fetchData: getUsers,
- props: { count: 100 }
+ props: { count: (state) => state.props.count }
});
```

As a bonus feature, you can define `props` as a factory function that returns an object. That lets you define one-time computed values.

In the following example `count` will be computed just at initialization time. Any subsequent change to the parent's state will not be propagated to the rendered component.

```diff
const AsyncUsersOnline = Loadable({
  component: UsersOnline,
  fetchData: getUsers,
- props: { count: (state) => state.props.count }
+ props: (props) => ({ count: props.count })
});
```

## Component Options

To provide the rendered component with options you can:

- pass them as the `options` object in the `Loadable` configuration object. They will be used as base options for every instance of the rendered component.
- pass them as the `options` object in the outlet component configuration. In this case it will be used just in that instance.

In the following example `instance1` will use the label defined in the Loadable factory (`'Friends online:'`), while `instance2` will use a custom label (`'Strangers online:'`):

```js
const AsyncUsersOnline = Loadable({
  component: UsersOnline,
  fetchData: getUsers,
  options: {
    label: 'Friends online:',
  },
});

const instance1 = new AsyncUsersOnline();

const instance2 = new AsyncUsersOnline({
  options: {
    label: 'Strangers online:',
  },
});
```

## API Documentation

- [Loadable](/packages/loadable/api/index)
