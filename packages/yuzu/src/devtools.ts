import { Component } from './component';
import { IObject } from '../types';
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

    function refTree(root: Component, tree: IObject) {
      if (root.$refsStore.size > 0) {
        root.$refsStore.forEach((ref, name) => {
          tree[name] = Object.create(null);
          refTree(ref, tree[name]);
        });
      }
      Object.defineProperty(tree, '$self', {
        enumerable: false,
        value: Object.assign(Object.create(null), {
          $raw: root,
          state: Object.assign(Object.create(null), root.state),
        }),
      });
      return tree;
    }

    proto.mount = function mountDev(...args) {
      mount.call(this, ...args);
      Object.defineProperty(this.$el as YuzuRoot, '$yuzu', {
        enumerable: false,
        writable: false,
        value: this,
      });

      Object.defineProperty(this, '$$getTree', {
        enumerable: false,
        writable: false,
        value() {
          const tree = Object.create(null);
          return refTree(this, tree);
        },
      });
      return this;
    };
  };
  /* eslint-enable no-param-reassign */
} else {
  devtools = (ComponentClass) => undefined;
}

export { devtools };
