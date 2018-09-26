import { Component } from './component';

let devtools: (c: typeof Component) => void;

if (process.env.NODE_ENV !== 'production') {
  /* eslint-disable no-param-reassign */
  devtools = (ComponentClass) => {
    const proto = ComponentClass.prototype;
    const { mount } = proto;

    proto.mount = function mountDev(...args) {
      mount.call(this, ...args);
      Object.defineProperty(this.$el, '$yuzu', {
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
