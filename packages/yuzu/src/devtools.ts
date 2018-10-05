import { Component } from './component';

/**
 * `devtools` is an helper function that will expose the instance of a Component in a `$yuzu` property attached to its root DOM element.
 *
 * !> To improve performance in production, this property will be available just when `process.env.NODE_ENV !== 'production'`.
 *
 * To initialize the devtools copy the following code into your entry point:
 *
 * ```js
 * import { Component, devtools } from 'yuzu';
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
