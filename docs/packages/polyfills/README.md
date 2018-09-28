# @yuzu/polyfills

> ES5 environments support polyfill

The `@yuzu/polyfills` package provides support for Yuzu in ES5 environments like Internet Explorer 11 and Safari 9.

## Provided Polyfills

- [core-js](https://www.npmjs.com/package/core-js)
  - `Array.from()`
  - `Map`
  - `Object.assign()`
  - `Object.entries()`
  - `Promise`
  - `String.prototype.includes`
  - `String.prototype.startsWith`
  - `Number.isNaN`
- [element-closest](https://www.npmjs.com/package/element-closest)
  - `Element.closest()`

## Installation

### as NPM package

```
npm install @yuzu/polyfills --save

# or

yarn add @yuzu/polyfills
```

### CDN delivered `<script>`

add the following script tags before your code

```html
<script src="https://unpkg.com/@yuzu/polyfills"></script>
```

## Usage

If you are using a package bundler like Webpack, import this module at the very top of your entry point file:

```js
import '@yuzu/polyfills';
```

**Note:** This package is not needed if you're already using polyfill libraries like `@babel/polyfill`.
