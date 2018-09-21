# @yuzu/core

> old school component management

JavaScript view libraries such as Vue and React are cool, but sometimes you just can't or don't want to use them, maybe because of SEO or because there's already a server-side application that outputs a page's HTML.

In those scenarios Yuzu can help you to keep your frontend application organized.

<!-- TOC -->

- [Installation](#installation)
  - [as NPM package](#as-npm-package)
  - [CDN delivered `<script>`](#cdn-delivered-script)
  - [ES2017 Syntax](#es2017-syntax)
    - [Webpack](#webpack)
    - [Rollup](#rollup)
- [Browser support](#browser-support)
- [Basic usage](#basic-usage)
  - [ES6+ usage](#es6-usage)
  - [ES5 usage](#es5-usage)
- [Example application](#example-application)
- [Component state and update tracking](#component-state-and-update-tracking)
  - [Tracking updates](#tracking-updates)
- [Child components definition](#child-components-definition)
  - [Child components' initial state and computed state](#child-components-initial-state-and-computed-state)
    - [1 to 1 computed state](#1-to-1-computed-state)
- [API summary](#api-summary)
  - [Lifecycle methods](#lifecycle-methods)
  - [State management](#state-management)
  - [Lifecycle hooks](#lifecycle-hooks)
  - [Lifecycle boundaries](#lifecycle-boundaries)
  - [Event bus](#event-bus)
  - [Child management methods](#child-management-methods)
- [Component Lifecycle diagram](#component-lifecycle-diagram) - [Stage: _create_](#stage-_create_) - [Stage: _mount_](#stage-_mount_) - [Stage: _init_](#stage-_init_) - [Async ready state](#async-ready-state) - [Stage: _update_](#stage-_update_) - [Stage: _destroy_](#stage-_destroy_)
- [Functional composition](#functional-composition)
  - [Multiple dynamic children](#multiple-dynamic-children)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)

<!-- /TOC -->

## Installation

### as NPM package

```
npm install @yuzu/core --save

# or

yarn add @yuzu/core
```

### CDN delivered `<script>`

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

## Browser support

Yuzu works in all modern browsers. In order to make it work in browsers that don't support ES2015+ features (like IE11) you need to include the `@yuzu/polyfills` package before any other `@yuzu/*` package.

If you're using a package bundler without any polyfill library like [babel-polyfill](https://babeljs.io/docs/en/babel-polyfill/) add this line at the very top of your entrypoint:

```js
import '@yuzu/polyfills';
```

## Basic usage

### ES6+ usage

Import `Component` into your project and extend it

```js
import { Component } from '@yuzu/core';

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

```js
import { Component } from '@yuzu/core';

class Counter extends Component {
  static defaultOptions() {
    return {
      label: 'Count',
    };
  }
  created() {
    this.state = {
      count: 0,
    };
  }

  initialize() {
    //...
  }
}

const counter = new Counter('#app');
```

### ES5 usage

In development environments that don't support `extends` (such as ES5), you can use the static `YZ.extend` function to achieve the same result:

```js
var Counter = YZ.extend(Component, {
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

var counter = new Counter('#app');
```

## Example application

Here is a _Counter_ component example:

```html
<div class="Counter">
  <span class="Counter__value"></span>
  <div>
    <button type="button" class="Counter__increment">Increment</button>
    <button type="button" class="Counter__decrement">Decrement</button>
  </div>
</div>
```

```js
import { Component } from '@yuzu/core';

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

  // methods

  update() {
    const { count } = this.state;
    const { label } = this.options;
    this.$els.value.innerText = `${label}: ${count}`;
  }
}

const counter = new Counter().mount(Counter.root);
```

**`root` (string)** is the root element CSS selector. It must be a static property and is required.

**`defaultOptions` (function)** returns an object with default options for the component. Custom options can be passed as first argument at instantiation time (ie: `new Counter({ label: 'Custom label'})`). This method must be static.

**`selectors` (object)** is used to set a reference to component's child elements. Keys will be used as element identifier attached to the `this.$els` collection while values are uses as CSS selector to match an element (with [`Element.querySelector`](https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelector)) in the context of the component's root element.
If you need to access the component's root element use `this.$el`.

**`listeners` (object)** is a shortcut syntax to set DOM event listeners on a given element. Each key has the following syntax:

```
eventName [CSS selector | @elementReference]
```

If the second part of the key starts with `@` a listener will be attached to the corresponding element referenced in `this.$els`. For example the key `click @increment` will attach a click listener to `this.$els.increment`

Using just the event name will attach the listener to the component's root element.

Event listeners are automatically removed when the component's `.destroy()` method is invoked.

**`state` (object)** is the component's internal state.

**`actions` (object)** is a map listing functions to execute whenever the state property defined in the property key has changed. If the property value is a string it will search the corresponding method on the class.

The function is invoked with the current and previous value as arguments.

In the counter example above whenever the state's `expanded` value changes the `toggle` method is executed.

## Component state and update tracking

Every component has a `state` property that reflects the component's internal state.

An initial state can be set as a class property or in the `created` lifecycle hook.
**Note:** setting a property's initial state is the only way to allow subsequent updates to it.

To update the state use the `setState` method. The first argument is an object with the part of the state you wan to update:

```js
this.setState({ count: 1 });
```

If you want to compute a new state values from the previous ones, pass a function instead of an object:

```js
this.setState((prevState) => ({ count: prevState.count + 1 }));
```

If you need to completely replace the current component's state use `replaceState`:

```js
class Counter extends Component {
  // ...
  stop() {
    this.replaceState({ count: 0, stop: true });
  }
}
```

### Tracking updates

Every call to `setState` will emit a `change:<property>` event on the component for each updated property.

```js
this.on('change:count', (value, preValue) => {
  console.log(`current: ${value}, (was ${prevValue})`);
});
this.setState({ count: 1 });
// logs: `current: 1, (was 0)`
```

To track every change to the state attach a listener to the special `change:*` event. The event handler will receive as arguments the new state as well as the previous one.

If you want to prevent change events to be emitted, pass a second argument `true` to `setState`

## Child components definition

In some scenarios you might need to control the lifecycle and state of components nested inside another component.

In this case you can use the `.setRef` method to link a child component's instance to its parent.

As bonus point, when the parent's `destroy` method is executed, every children's `destroy` method is called as well before tearing down the instance (`destroy` is an async method)

A full example below

```html
<div class="Counter">
  <span class="Text"></span>
  <div>
    <button type="button" class="Counter__increment">Increment</button>
    <button type="button" class="Counter__decrement">Decrement</button>
  </div>
</div>
```

```js
import Component from '@/components/Component';

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

### Child components' initial state and computed state

`setRef` accepts a second argument which is an object used as the child component's initial state during initialization. If a property value is a function it will be used to compute the child state value and subsequent changes to the parent state will be propagated to the child state as well.

The `Counter` component above could be refactored like this

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

The function associated to `content` will receive the parent state and the child instance reference as first and second argument.

#### 1 to 1 computed state

`Component` is not able to guess which properties are involved during the computation so it will listen for every state change and propagate that change to the child component.

While this is pretty fine (and necessary) when computing a state property from multiple parent's state properties, it could raise edge cases and performance issues.

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

## API summary

### Lifecycle methods

- `init` Initializes the component with state
- `mount` Mounts a component instance onto a DOM element and initializes it
- `destroy` Un-mounts a component and its children (_async_)

### State management

- `getState` Returns a value from the state
- `setState` Updates the internal state

### Lifecycle hooks

- `created` Instance created
- `beforeMount` Before mounting onto the DOM
- `mounted` Mounted onto the DOM
- `initialize` Just before component actions evaluation
- `ready` Instance fully initialized
- `beforeDestroy` Just before tearing down the instance (_async_)

### Lifecycle boundaries

- `shouldUpdateState` Checks whether a state property should be update
- `readyState` Delays `ready` hook until the component's state has a given value

### Event bus

- `on`
- `once`
- `off`
- `emit`

See [dush](https://github.com/tunnckocore/dush) for details

### Child management methods

- `setRef` (_async_)
- `broadcast`

## Component Lifecycle diagram

#### Stage: _create_

```js
const inst = new Component();
```

Accepts an optional object with instance options

- sets: `this.options`
- calls hook: `created`

#### Stage: _mount_

```js
inst.mount('#el');
```

Requires a DOM element or CSS string used to resolve the component's root element. Accepts an object used as the instance initial state.

It will automatically transition to the _init_ stage (see below) unless the second argument is `null`.

- sets: event listeners and `this.$els` references

#### Stage: _init_

```js
inst.init({});
```

Automatically called by `.mount()` when the second argument is `!== null`. Accepts an object used as the instance initial state.

- calls hook: `initialize`
- sets: actions, state
- calls hooks: `mounted`, `ready`

##### Async ready state

`ready` hook can be delayed by setting a `readyState` method. This method will receive the current and previous state and will be triggered on every state update until it returns `true`.

This method can be useful when you need to delay the call to the `ready` hook until an async AJAX call is finished:

```js
class UserList extends Component {
  state = {
    users: [],
  };

  initialize() {
    this.$el.classList.add('is-loading');
    this.fetchUsers().then((users) => {
      this.setState({ users });
    });
  }

  readyState({ users }) {
    return users.length > 0;
  }

  ready() {
    this.$el.classList.remove('is-loading');
  }
}
```

#### Stage: _update_

Executed on every call to `.setState` and `.replaceState` when the second argument is `!== true`. Will trigger a `change:...` event for each changed key.

Calls to `.setState` will trigger a conditional method `shouldUpdateState`. The method will be executed on each passed-in key and receives the key, it's current value and the provided new value. If the methods returns `true` the value will be updated and change events will be triggered. The default implementation is:

```js
shouldUpdateState(key, currentValue, newValue) {
  return currentValue !== newValue;
}
```

You can overwrite this method with a custom implementation on your components.

**Note** calls to `.replaceState` are not affected by this method and will always trigger an update.

#### Stage: _destroy_

```js
inst.destroy();
```

- calls hook: `beforeDestroy`
- destroys child component, removes event listeners and DOM listeners

## Functional composition

To compose nested components you can simply use the [`setRef`](doc/component.md#setref) method to register child components:

```js
class Navigation extends Component {
  // ...
}

class Gallery extends Component {
  beforeInit() {
    this.setRef({
      id: 'navigation',
      component: Navigation,
      el: '.gallery__nav',
    });
    // this.$refs.navigation.$el === '<ul class="gallery__nav" />'
  }
}

const gallery = new Gallery('#gallery');
```

If you prefer a more _functional_ approach you can use the [`mount`](doc/mount.md) helper:

```js
import { Component, mount } from '@yuzu/core';

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
  null, // <-- options
  [mount(Navigation, '.gallery__nav')],
  // ^--- array of children components
);

//mount it onto the DOM
const gallery = galleryTree();
```

### Multiple dynamic children

In some scenarios you may need to manage a variable number of child components (like in a list of items). To account for that scenario, instead of an array of mount functions you can pass a function returning an array:

```js
import { Component, mount } from '@yuzu/core';

class Menu extends Component {
  // ...
}

class Link extends Component {
  // ...
}

const menuTree = mount(
  Menu,
  '#menu',
  null,
  (ctx) => {
    // ctx is the instance of Menu
    const links = Array.from(ctx.$el.querySelectorAll('.menu__link'))
    const children = []
    for (let i = 0; i < links.length: i += 1) {
      children.push(mount(Link, el))
    }
    return children
  }
);

//mount it onto the DOM
const menu = menuTree();
```

We could also rewrite the above example using Yuzu's `Children` utility function:

```js
import { Component, Children, mount } from '@yuzu/core';

class Menu extends Component {
  // ...
}

class Link extends Component {
  // ...
}

const menuTree = mount(
  Menu,
  '#menu',
  null,
  Children('.menu__link', (el, i) => mount(Link, el)),
);

//mount it onto the DOM
const menu = menuTree();
```

## API Documentation

- [Component](doc/component.md)
- [Children](doc/children.md)
- [mount](doc/mount.md)
- [extend](doc/extend.md)

## Contributing

1.  Fork it or clone the repo
1.  Install dependencies `yarn install`
1.  Code your changes and write new tests in the `test` folder.
1.  Ensure everything is fine by running `yarn build`
1.  Push it or submit a pull request :D
