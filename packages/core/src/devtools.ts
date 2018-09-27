import { Component } from './component';

/**
 * `devtool` is an helper function that will expose the instance of a Component in a `$yuzu` property attached to the root DOM element
 *
 * To improve performance in production, this property will be available just when `process.env.NODE_ENV !== 'production'`.
 *
 * To initialize the devtools copy the following code in your entry point:
 *
 * ```js
 * import { Component, devtools } from '@yuzu/core';
 *
 * devtools(Component);
 * ```
 */
let devtools: (c: typeof Component) => void;

export type YuzuRoot = Element & { $yuzu: Component };

if (process.env.NODE_ENV !== 'production') {
  /* eslint-disable no-param-reassign */
  devtools = (ComponentClass) => {
    const proto = ComponentClass.prototype;
    const { mount } = proto;

    proto.mount = function mountDev(...args) {
      mount.call(this, ...args);
      Object.defineProperty(this.$el as YuzuRoot, '$yuzu', {
        enumerable: false,
        writable: false,
        value: this,
      });
      return this;
    };
  };
  /* eslint-enable no-param-reassign */
} else {
  devtools = (ComponentClass) => undefined;
}

export { devtools };
