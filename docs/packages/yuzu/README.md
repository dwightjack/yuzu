# yuzu

> old school component management

Manage your HTML based components in style with progressive enhancement.

<!-- TOC depthTo:3 -->

- [Installation](#installation)
  - [As NPM Package](#as-npm-package)
  - [CDN Delivered `<script>`](#cdn-delivered-script)
  - [ES2017 Syntax](#es2017-syntax)
- [Browser Support](#browser-support)
- [Basic Usage](#basic-usage)
  - [ES6+ Usage](#es6-usage)
  - [ES5 Usage](#es5-usage)
- [Example Application](#example-application)
  - [Application Breakdown](#application-breakdown)
- [State and Update Tracking](#state-and-update-tracking)
  - [Tracking Updates](#tracking-updates)
- [Child Components](#child-components)
  - [Child Components' Initial State and Computed State](#child-components-initial-state-and-computed-state)
  - [Child to Parent Communication](#child-to-parent-communication)
  - [Child Component Replacement](#child-component-replacement)
- [API Summary](#api-summary)
  - [Lifecycle Methods](#lifecycle-methods)
  - [State Management](#state-management)
  - [Lifecycle Hooks](#lifecycle-hooks)
  - [Lifecycle Boundaries](#lifecycle-boundaries)
  - [Event Bus](#event-bus)
  - [Child Management Methods](#child-management-methods)
- [Component Lifecycle](#component-lifecycle)
  - [Async Ready State](#async-ready-state)
  - [Conditional State Updates](#conditional-state-updates)
- [Functional Composition](#functional-composition)
  - [Multiple Dynamic Children](#multiple-dynamic-children)
- [Developer Tools](#developer-tools)
- [API Documentation](#api-documentation)

<!-- /TOC -->

## Installation

### As NPM Package

```
npm install yuzu --save

# or

yarn add yuzu
```

### CDN Delivered `<script>`

Add the following script tag before your code

```html
<script src="https://unpkg.com/yuzu"></script>
```

Yuzu modules will be available in the global scope under the `YZ` namespace (`YZ.Component`, `YZ.mount`, etc.).

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
+      'yuzu': 'yuzu/dist/index.next.js'
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
+      'yuzu': path.resolve(__dirname, 'node_modules/yuzu/dist/index.next.js')
+    })
  ],
};
```

## Browser Support

Yuzu works in all modern browsers. In order to make it work in browsers that don't support ES2015+ features (like IE11) you need to include the [**yuzu-polyfills**](/packages/polyfills/) package before any other `yuzu*` package.

If you're using a package bundler without any polyfill library like [babel-polyfill](https://babeljs.io/docs/en/babel-polyfill/) add this line at the very top of your entry point:

```js
import 'yuzu-polyfills';
```

## Basic Usage

### ES6+ Usage

Import `Component` into your project and extend it

```js
import { Component } from 'yuzu';

class Counter extends Component {
  static defaultOptions = () => ({
    label: 'Count',
  });

  state = {
    count: 0,
  };

  initialize() {
    //...
  }
}

const counter = new Counter('#app');
```

**Note:** The above example uses [stage 3](https://github.com/tc39/proposals#stage-3) syntax for instance and static public fields.

In order to use it you will need to use [Babel](https://babeljs.io/) with the [`transform-class-properties` plugin](https://babeljs.io/docs/en/babel-plugin-transform-class-properties/) ([@babel/plugin-proposal-class-properties](https://www.npmjs.com/package/@babel/plugin-proposal-class-properties) in Babel 7+) or [Typescript](https://www.typescriptlang.org/).
If you prefer not to, the previous code can be rewritten like this:

```diff
import { Component } from 'yuzu';

class Counter extends Component {
- static defaultOptions = () => ({
-   label: 'Count',
- });

+ static defaultOptions() {
+   return {
+     label: 'Count',
+   };
+ }

-  state = {
-    count: 0,
-  };

+ created() {
+   this.state = {
+     count: 0,
+   };
+ }

  initialize() {
    //...
  }
}

const counter = new Counter().mount('#app');
```

### ES5 Usage

In development environments that don't support ES6 [`class`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes) (like IE11), you can use the static `YZ.extend` function to achieve the same result:

```js
var Counter = YZ.extend(YZ.Component, {
  created: function() {
    this.state = {
      count: 0,
    };
  },

  initialize: function() {
    //...
  },
});

Counter.defaultOptions = function() {
  return { label: 'Count' };
};

var counter = new Counter().mount('#app');
```

## Example Application

Here is a _Counter_ component example:

```html
<div class="Counter">
  <span class="Counter__value"></span>
  <div>
    <button type="button" class="Counter__decrement">Decrement</button>
    <button type="button" class="Counter__increment">Increment</button>
  </div>
</div>
```

```js
import { Component } from 'yuzu';

class Counter extends Component {
  // Root element CSS selector
  static root = '.Counter';

  static defaultOptions = () => ({
    label: 'Count',
  });

  // DOM management

  selectors = {
    increment: '.Counter__increment',
    decrement: '.Counter__decrement',
    value: '.Counter__value',
  };

  listeners = {
    'click @increment': () => {
      this.setState(({ count }) => ({ count: count + 1 }));
    },
    'click @decrement': () => {
      this.setState(({ count }) => ({ count: count - 1 }));
    },
  };

  // internal state management

  state = {
    count: 0,
  };

  actions = {
    count: 'update',
  };

  // lifecycle

  mounted() {
    console.log(`Current count ${this.state.count}`);
  }

  // methods

  update() {
    const { count } = this.state;
    const { label } = this.options;
    this.$els.value.innerText = `${label}: ${count}`;
  }
}

const counter = new Counter().mount(Counter.root);
```

[![Edit Yuzu Demo](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/4w5ml1kmk0?initialpath=%2Fbase&module=%2Fexamples%2Fbase%2Findex.js)

### Application Breakdown

#### `root` (string)

```js
// Root element CSS selector
static root = '.Counter';
```

This is the root element CSS selector. It must be a static property and is required when using yuzu-application's [Sandbox](/packages/application/sandbox) module.

#### `defaultOptions` (function)

```js
static defaultOptions = () => ({
  label: 'Count',
});
```

Returns an object with default options for the component. Custom options can be passed as first argument at instantiation time (ie: `new Counter({ label: 'Custom label'})`).

**This method must be static.**

#### `selectors` (object)

```js
selectors = {
  increment: '.Counter__increment',
  decrement: '.Counter__decrement',
  value: '.Counter__value',
};
```

This is used to set a reference to component's child DOM elements. Keys will be used as element identifier attached to the `this.$els` collection while values are uses as CSS selector to match an element (with [`Element.querySelector`](https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelector)) in the context of the component's root element.

?> If you need to access the component's root element use `this.$el`.

#### `listeners` (object)

```js
listeners = {
  'click @increment': () => {
    this.setState(({ count }) => ({ count: count + 1 }));
  },
  'click @decrement': () => {
    this.setState(({ count }) => ({ count: count - 1 }));
  },
};
```

A shortcut syntax to set DOM event listeners on a given element. Each key has the following syntax:

```
eventName [CSS selector | @elementReference]
```

If the second part of the key starts with `@` a listener will be attached to the corresponding element referenced in `this.$els`. For example the key `click @increment` will attach a click listener to `this.$els.increment`

Using just the event name will attach the listener to the component's root element.

Event listeners are automatically removed when the component's `.destroy()` method is invoked.

#### `state` (object)

```js
state = {
  count: 0,
};
```

This is the component's internal state.

#### `actions` (object)

```js
actions = {
  count: 'update',
};
```

This is a map listing functions to execute whenever a state property has changed. If the property value is a string it will search the corresponding method on the class.

In the example application whenever the `count` state value changes the `update` method will be fired.

?> The function is invoked with the current and previous value as arguments.

#### lifecycle methods

```js
mounted() {
  console.log(`Current count ${this.state.count}`);
}
```

These methods are called by the instance during its [lifecyle](#component-lifecycle).

#### methods

```js
update() {
  const { count } = this.state;
  const { label } = this.options;
  this.$els.value.innerText = `${label}: ${count}`;
}
```

Any other method is treated as a class method. You can use it like you'd do on any _plain_ javascript object instance.

## State and Update Tracking

Every component has a `state` property that reflects the component's internal state.

An initial state can be set as a class property or in the `created` lifecycle hook.

!> **Note:** setting a property's initial state is the only way to allow subsequent updates to it.

To update the state use the `setState` method. The first argument is an object with the part of the state you want to update:

```js
this.setState({ count: 1 });
```

If you want to compute a new state value from the previous one, pass a function instead of an object:

```js
this.setState((prevState) => ({ count: prevState.count + 1 }));
```

If you need to completely replace the current state use `replaceState`:

```js
class Counter extends Component {
  // ...
  stop() {
    this.replaceState({ count: 0, stop: true });
  }
}
```

### Tracking Updates

Every call to `setState` will emit a `change:<property>` event for each updated property.

```js
this.on('change:count', (value, prevValue) => {
  console.log(`current: ${value}, (was ${prevValue})`);
});
this.setState({ count: 1 });
// logs: `current: 1, (was 0)`
```

To track every change to the state, attach a listener to the special `change:*` event. The event handler will receive the new state as well as the previous one as arguments.

```js
this.on('change:*', (state, prevState) => {
  console.log(`current: ${state.count}, (was ${prevState.count})`);
});
this.setState({ count: 1 });
// logs: `current: 1, (was 0)`
```

?> If you want to prevent change events to be emitted, pass a second argument `true` to `setState` (_silent_ update).

## Child Components

In some scenarios you might need to control the lifecycle and state of components nested inside another component.

In this case you can use the `setRef` method to link a child component's instance to its parent.

As bonus point, when the parent's `destroy` method is executed, every children's `destroy` method is called as well.

!> Yuzu will ensure that all child components have been destroyed before tearing down the parent.

Here is a full example:

```html
<div class="Counter">
  <span class="Text"></span>
  <div>
    <button type="button" class="Counter__decrement">Decrement</button>
    <button type="button" class="Counter__increment">Increment</button>
  </div>
</div>
```

```js
import { Component } from 'yuzu';

class Text extends Component {
  static root = '.Text';

  state = {
    content: '',
  };

  actions = {
    content(value) {
      this.$el.textContent = value;
    },
  };
}

class Counter extends Component {
  // Root element selector (required)
  static root = '.Counter';

  static defaultOptions = () => ({
    label: 'Count',
  });

  // DOM management

  selectors = {
    increment: '.Counter__increment',
    decrement: '.Counter__decrement',
    text: '.Text',
  };

  listeners = {
    'click @increment': () => {
      this.setState(({ count }) => ({ count: count + 1 }));
    },
    'click @decrement': () => {
      this.setState(({ count }) => ({ count: count - 1 }));
    },
  };

  // internal state management

  state = {
    count: 0,
  };

  actions = {
    count: 'update',
  };

  // set here the child reference
  initialize() {
    this.setRef({
      id: 'text',
      component: Text,
      el: this.$els.text,
    });
  }

  // methods

  update() {
    const { count } = this.state;
    const { label } = this.options;
    this.$refs.text.setState({ content: `${label}: ${count}` });
  }
}

const counter = new Counter().mount(Counter.root);
```

[![Edit Yuzu Demo](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/4w5ml1kmk0?initialpath=%2Fchildren&module=%2Fexamples%2Fchildren%2Findex.js)

### Child Components' Initial State and Computed State

`setRef` accepts a second argument which will be used during initialization as the child component's initial state.

If a property value is a function it will be used to compute the child state value and all **subsequent changes** to the parent state will be propagated to the child state as well.

The `Counter` component above could be refactored like this:

```diff
class Counter extends Component {
  // ...

-  actions = {
-    count: 'update',
-  }

  initialize() {
    this.setRef({
      id: 'text',
      component: Text,
      el: this.$els.text,
-    })
+    }, {
+      content: ({ count }) => `${this.options.label}: ${count}`
+    })
  }

-  update() {
-    const { count } = this.state
-    const { label } = this.options
-    this.$refs.text.setState({ content: `${label}: ${count}` })
-  }
}
```

The function associated to `content` will receive the parent state and the child instance reference as arguments.

#### 1 to 1 Computed State

`Component` is not able to guess which properties are involved during the computation so it will listen for every state change and re-compute the child state.

While this is pretty fine (and necessary) when computing a state property from multiple parent's state properties, it could raise edge cases and performance issues due to unwanted function executions.

To mitigate this problem you can leverage the special `from>to`syntax to create a one to one mapping between child and parent properties:

```diff
  initialize() {
    this.setRef({
      id: 'text',
      component: Text,
      el: this.$els.text,
    }, {
-      content: ({ count }) => `${this.options.label}: ${count}`
+      'count>content': (value) => `${this.options.label}: ${value}`
    })
  }
```

The function associated to this mapping will receive the parent's state property value instead of the whole state and the library will keep track just of the changes on that property.

### Child to Parent Communication

In scenarios where you need to establish a communication between children and their parent component, the preferred pattern is by means of events:

```js
// parent.js
this.$refs.on('message', (value) => {
  this.setState({ childMessage: value });
});

// child.js
this.emit('message', this.state.message);
```

To simplify this operation you can set event - handler pairs on an `on` object passed to `setRef`:

```js
this.setRef({
  id: 'child',
  el: this.$els.child,
  component: Child,
  on: {
    message: (value) => {
      this.setState({ childMessage: value });
    },
  },
});
```

### Child Component Replacement

If you assign a child reference to an `id` value already assigned to an active child, the active child will be destroyed and the new reference will take its place.

?> The new reference will be initialized **after** the destroy lifecycle of the previous reference has complete. This lets you set, for example, an exit transition of the instance on its `beforeDestroy` async hook.

Open the following link to see a working example.

[![Edit Yuzu Demo](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/4w5ml1kmk0?fontsize=16&initialpath=%2Fchildreplace&module=%2Fexamples%2Fchild-replace%2Findex.js)

## API Summary

Full documentation available [here](/packages/yuzu/api/component).

### Lifecycle Methods

- `init` Initializes the component with state
- `mount` Mounts a component instance onto a DOM element and initializes it
- `destroy` (_async_) Un-mounts a component and its children

### State Management

- `getState` Returns a value from the state
- `setState` Updates the state

### Lifecycle Hooks

- `created` Instance created
- `beforeMount` Before mounting onto the DOM
- `mounted` Mounted onto the DOM
- `initialize` Just before component actions evaluation
- `ready` Instance fully initialized
- `beforeDestroy` (_async_) Just before tearing down the instance

### Lifecycle Boundaries

- `shouldUpdateState` Checks whether a state property should be updated
- `readyState` Delays `ready` hook until the component's state has a given value. See [below](#async-ready-state) for details.

### Event Bus

- `on`
- `once`
- `off`
- `emit`

See [dush](https://github.com/tunnckocore/dush) for details.

### Child Management Methods

- `setRef` (_async_)
- `broadcast`

## Component Lifecycle

| Stage                 | Hooks                        | Called upon                    | Initialized features                                           |
| --------------------- | ---------------------------- | ------------------------------ | -------------------------------------------------------------- |
| create                | `created()`                  | component instantiation        | options (`this.options`)                                       |
| mount <sup>(1)</sup>  | `beforeMount()`, `mounted()` | `mount()`                      | event handlers (`this.listeners`) and `this.$els.*` references |
| init <sup>(2)</sup>   | `initialize()`, `ready()`    | `ready()`                      | actions and state (`this.state`)                               |
| update <sup>(3)</sup> | `change:` events             | `replaceState()`, `setState()` | &nbsp;                                                         |
| destroy               | `beforeDestroy()`            | `destroy()`                    | &nbsp;                                                         |

**Notes:**

1.  `mount` Requires a DOM element or CSS string used to resolve the component's root element. Accepts an object as second argument used as the instance initial state.<br>It will automatically transition to the _init_ stage (see below) unless the second argument is `null`.
1.  Automatically called by `mount` when the second argument is `!== null`. Accepts an object used as the instance initial state.
1.  Executed on every call to `setState` and `replaceState` when the second argument is `!== true`. Will trigger a `change:...` event for each changed key.

### Async Ready State

`ready` hook can be delayed by setting a `readyState` method. This method will receive the current and previous state and will be triggered on every state update until it returns `true`.

This method can be useful when you need to delay the call to the `ready` hook until an async AJAX call has finished:

```js
class UserList extends Component {
  // ...

  state = {
    users: [],
  };

  initialize() {
    this.$els.status.innerText = 'loading...';
    this.fetchUsers().then((users) => {
      this.setState({ users });
    });
  }

  // delay ready until the `users` array is populated
  readyState({ users }) {
    return users.length > 0;
  }

  ready() {
    this.$els.status.innerText = 'loaded!';
  }
}
```

[![Edit Yuzu Demo](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/4w5ml1kmk0?initialpath=%2Freadystate&module=%2Fexamples%2Freadystate%2Findex.js)

### Conditional State Updates

Calls to `setState` will trigger a conditional method `shouldUpdateState`. The method will be executed on each passed-in key and receives the key, its current value and the provided new value. If the method returns `true` the value will be updated and change events will be triggered.

The default implementation is:

```js
shouldUpdateState(key, currentValue, newValue) {
  return currentValue !== newValue;
}
```

You can overwrite this method with a custom one in your components.

!> **Note** calls to `replaceState` are not affected by this method and will always trigger an update.

## Functional Composition

As seen before, to compose nested components you can use the [`setRef`](/packages/yuzu/api/component#setref) method to register child components:

```js
class Navigation extends Component {
  // ...
}

class Gallery extends Component {
  initialize() {
    this.setRef({
      id: 'navigation',
      component: Navigation,
      el: '.gallery__nav',
    });
    // this.$refs.navigation.$el === '<ul class="gallery__nav" />'
  }
}

const gallery = new Gallery().mount('#gallery', { currentImage: 1 });
```

If you prefer a more _functional_ approach you can use the [`mount`](/packages/yuzu/api/mount) helper:

```js
import { Component, mount } from 'yuzu';

class Navigation extends Component {
  // ...
}

class Gallery extends Component {
  // ...
}

//setup a component tree
const galleryTree = mount(
  Gallery,
  '#gallery',
  {
    state: { currentImage: 1 } // <-- initial state
    theme: 'red' // <-- instance options
  },
  [mount(Navigation, '.Gallery__nav')],
  // ^--- array of children components
);

//mount it onto the DOM
const gallery = galleryTree();
```

### Multiple Dynamic Children

There are scenarios where you may need to manage a variable number of child components (like in a list of items). To account for that, instead of an array of mount functions you can pass a function returning an array:

```js
import { Component, mount } from 'yuzu';

class Menu extends Component {
  // ...
}

class Link extends Component {
  // ...
}

const menuTree = mount(
  Menu,
  '#menu',
  {},
  (ctx) => {
    // ^--- ctx is the instance of Menu
    const links = Array.from(ctx.$el.querySelectorAll('.menu__link'))
    const children = []
    for (let i = 0; i < links.length: i += 1) {
      children.push(mount(Link, el))
    }
    return children // <-- returns an array of mount functions
  }
);

//mount it onto the DOM
const menu = menuTree();
```

We could also rewrite the above example using Yuzu's [`Children`](/packages/yuzu/api/children) utility function:

```js
import { Component, Children, mount } from 'yuzu';

class Menu extends Component {
  // ...
}

class Link extends Component {
  // ...
}

const menuTree = mount(
  Menu,
  '#menu',
  {},
  Children('.menu__link', (el, i) => mount(Link, el)),
);

//mount it onto the DOM
const menu = menuTree();
```

## Developer Tools

Yuzu provides a simple `devtools` module that will allow you to inspect a component instance by attaching a `$yuzu` to its root DOM element. To enable this feature copy the following snippet into your entry point:

```js
import { Component, devtools } from 'yuzu';

devtools(Component);
```

You will be then able to inspect any component instance on your favorite developer tools' console by selecting it and read the `.$yuzu` property.

![Inspecting the state in Chrome DevTools](images/devtools.png)
_Inspecting the state in Chrome DevTools_

!> To maximize performances and minimize bundle size devtools are shipped just in development mode (`process.env.NODE_ENV !== 'production'` ). In production mode the code will be replaced with a void function.

## API Documentation

- [Component](/packages/yuzu/api/component)
- [Children](/packages/yuzu/api/children)
- [mount](/packages/yuzu/api/mount)
- [extend](/packages/yuzu/api/extend)
- [mount](/packages/yuzu/api/devtools)
