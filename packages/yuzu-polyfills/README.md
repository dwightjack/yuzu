# yuzu-polyfills

> legacy environments support polyfills

The `yuzu-polyfills` package provides support for Yuzu in legacy environments like Internet Explorer 11 and Safari 9.

## Included Polyfills

- [core-js 3](https://www.npmjs.com/package/core-js)
  - `Array.from()`
  - `Map`
  - `Object.assign()`
  - `Object.entries()`
  - `Promise`
  - `String.prototype.includes()`
  - `String.prototype.startsWith()`
  - `Number.isNaN()`
- [element-closest](https://www.npmjs.com/package/element-closest)
  - `Element.closest()`
- [`ChildNode.remove()`](https://developer.mozilla.org/en-US/docs/Web/API/ChildNode/remove)
- [`Number.MAX_SAFE_INTEGER`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER#Polyfill)

## Installation

### As NPM Package

```
npm install yuzu-polyfills --save

# or

yarn add yuzu-polyfills
```

### CDN Delivered `<script>`

Add the following script tag before including yuzu

```html
<script src="https://unpkg.com/yuzu-polyfills"></script>
```

## Usage

If you are using a package bundler like Webpack, import this module at the very top of your entry point file:

```js
import 'yuzu-polyfills';
```
