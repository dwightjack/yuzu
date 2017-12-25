# Yuzu

> old school component management

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
<script src="https://unpkg.com/tsumami"></script> <!-- hard dependency -->
<script src="https://unpkg.com/yuzu"></script>
```

Yuzu modules will be available in the global scope under the `YZ` namespace:

* `YZ.Component`: Component constructor [docs](doc/component.md)
* `YZ.Children`: children elements iterator founction [docs](doc/children.md)
* `YZ.mount`: functional components' tree generator [docs](doc/mount.md)

## Usage

### ES6+ usage

Import `Component` constructor into your project and use it

```js
import { Component } from 'yuzu';

class MyComponent extends Component {

	getInitialState() {
		return {
			key: 'value'
		};
	}

	beforeInit() {
		//...
	}
}

const app = new MyComponent('#app');
```

### ES5 usage

In environments that don't support `extends` (such as ES5), you can use the static `Component.create` method to achieve the same result:

 ```js
var MyComponent = YZ.Component.create({

	getInitialState: function () {
		return {
			key: 'value'
		};
	},

	beforeInit: function () {
		//...
	}
});

var app = new MyComponent('#app');
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
			el: '.gallery__nav'
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
	[
		mount(
			Navigation,
			'.gallery__nav'
		)
	]
);

//mount it onto the DOM
const gallery = galleryTree();
```

## Documentation

* [Component](doc/component.md)
* [Children](doc/children.md)
* [mount](doc/mount.md)

## Contributing

1. Fork it or clone the repo
1. Install dependencies `yarn install`
1. Code your changes and write new tests in the `test` folder.
1. Ensure everything is fine by running `yarn build`
1. Push it or submit a pull request :D
