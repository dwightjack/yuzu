# Yuzu

> old school component management

JavaScript view libraries such as Vue and React are cool, but sometimes you just can't or don't want to use them, maybe because of SEO or because there's already a server-side application that outputs a page's HTML.

In those scenarios Yuzu can help you to keep your frontend application organized.

## Installation

### as NPM package

```
npm install yuzu --save

# or

yarn add yuzu
```

### CDN delivered `<script>`

add the following script tags before your code

```html
<script src="https://unpkg.com/yuzu"></script>
```

Yuzu modules will be available in the global scope under the `YZ` namespace (`YZ.Component`, `YZ.Sandbox`, etc...)

### Browser support

Although Yuzu is compiled to ES5, it uses some features available in ES6+. In order to make it work in older browsers you need to include in your scripts polyfills from the [core-js](https://www.npmjs.com/package/core-js) and [element-closest](https://www.npmjs.com/package/element-closest) packages.

## Usage

### ES6+ usage

Import `Component` constructor into your project and extend it

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

In order to use it you will need to use [Babel](https://babeljs.io/) with the [`transform-class-properties` plugin](https://babeljs.io/docs/en/babel-plugin-transform-class-properties/) ([@babel/plugin-proposal-class-properties](https://www.npmjs.com/package/@babel/plugin-proposal-class-properties) in Babel 7+) or [Typescript](https://www.typescriptlang.org/). If you prefer not to, the previous code can be rewritten liek this:

```js
import { Component } from 'yuzu';

class Counter extends Component {
  created() {
    this.state = {
      count: 0,
    };
  }

  initialize() {
    //...
  }
}

Counter.defaultOptions = () => ({
  label: 'Count',
});

const counter = new Counter('#app');
```

### ES5 usage

In development environments that don't support `extends` (such as ES5), you can use the static `Component.create` method to achieve the same result:

```js
var Counter = YZ.Component.create({
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

### Functional composition

To compose nested components you can simply use parent's [`setRef`](doc/component.md#setref) method to register child components:

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
import { Component, Children, mount } from 'yuzu';

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
);

//mount it onto the DOM
const gallery = galleryTree();
```

## Documentation

- [Component](doc/component.md)
- [Children](doc/children.md)
- [mount](doc/mount.md)

## Contributing

1.  Fork it or clone the repo
1.  Install dependencies `yarn install`
1.  Code your changes and write new tests in the `test` folder.
1.  Ensure everything is fine by running `yarn build`
1.  Push it or submit a pull request :D
