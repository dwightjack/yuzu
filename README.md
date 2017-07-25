# Yuzu (WIP)

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
<script src="https://unpkg.com/desandro-classie"></script> <!-- hard dependency -->
<script src="https://unpkg.com/tsumami"></script> <!-- hard dependency -->
<script src="https://unpkg.com/yuzu"></script>
```

Yuzu modules will be available in the global scope under the `YZ` namespace:

* `YZ.Component`: Component constructor [docs](doc/index.md)

## Usage

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

## Contributing

1. Fork it or clone the repo
1. Install dependencies `yarn install`
1. Code your changes and write new tests in the `test` folder.
1. Ensure everything is fine by running `yarn build`
1. Push it or submit a pull request :D
