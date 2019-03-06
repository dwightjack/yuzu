import { Component } from './component';
import { IObject, IStateLogger, IState } from '../types';
/**
 * `devtools` is an helper function that will expose the instance of a Component in a `$yuzu` property attached to its root DOM element.
 *
 * It will also extend every Component instance with some useful methods.
 *
 * !> To improve performance in production, this property and its methods will be available just when `process.env.NODE_ENV !== 'production'`.
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
  /**
   *
   * @private
   * @param {string} label Logger name
   */
  const createStateLogger = (label: string): IStateLogger<Component> => {
    const $listeners = new Map<string, any>();

    /**
     * @namespace logger
     * @private
     */
    return {
      label,

      /**
       * Subscribes to a specific event and logs its arguments when emitted. Returns an unsubscribe function.
       *
       * @private
       * @see logger#log
       * @param {Component} instance Target instance
       * @param {string} [event='change:*'] Event to subscribe to
       * @returns {function}
       */
      subscribe(instance, event = 'change:*') {
        const key = event === 'change:*' ? 'change' : event;
        const listener = this.log.bind(this, key);
        if ($listeners.has(event)) {
          /* tslint:disable no-console */
          console.warn(`Already listening for "${event}" on ${instance.$uid}`);
          /* tslint:enable no-console */
        }
        instance.on(event, listener);
        $listeners.set(event, listener);
        return () => {
          this.unsubscribe(instance, event);
        };
      },

      /**
       * Unsubscribes the logger from a specific event.
       *
       * @private
       * @param {Component} instance Target instance
       * @param {string} [event='change:*'] Event to subscribe to
       */
      unsubscribe(instance, event = 'change:*') {
        if ($listeners.has(event)) {
          instance.off(event, $listeners.get(event));
          $listeners.delete(event);
        }
      },

      /**
       * Unsubscribes the logger from every event.
       *
       * @private
       * @param {Component} instance Target instance
       */
      unsubscribeAll(instance) {
        $listeners.forEach((listener, event) => {
          instance.off(event, listener);
        });
        $listeners.clear();
      },

      /**
       * Logs formatted data.
       *
       * @private
       * @param {string} msg Log message
       * @param {*} next The current value
       * @param {*} [prev] An optional previous value
       * @param {*[]} args Additional arguments
       */
      log(msg, next, prev, args) {
        if (process.env.NODE_ENV !== 'production') {
          /* tslint:disable no-console */
          const head = [
            `%c${label}: %c${msg}`,
            'color: gray; font-weight: lighter',
            'color: green; font-weight: bolder',
          ];
          if (args && args.length > 0) {
            head.push(...args);
          }
          console.groupCollapsed(...head);

          if (prev !== undefined) {
            console.log(
              '%cprev state',
              'color: gray; font-weight: bolder',
              prev,
            );
            console.log(
              '%cnext state',
              'color: green; font-weight: bolder',
              next,
            );
          } else {
            console.log(
              '%cinitial state',
              'color: gray; font-weight: bolder',
              next,
            );
          }
          console.groupEnd();
          /* tslint:enable no-console */
        }
      },
    };
  };

  /* eslint-disable no-param-reassign */
  devtools = (ComponentClass) => {
    /**
     * Methods and properties added by devtools
     *
     * @name Component
     */
    const proto = ComponentClass.prototype;
    const { mount, init, destroy } = proto;

    // function refTree(root: Component, tree: IObject) {
    //   if (root.$refsStore.size > 0) {
    //     root.$refsStore.forEach((ref, name) => {
    //       tree[name] = Object.create(null);
    //       refTree(ref, tree[name]);
    //     });
    //   }
    //   Object.defineProperty(tree, '$self', {
    //     enumerable: false,
    //     value: Object.assign(Object.create(null), {
    //       $raw: root,
    //       state: Object.assign(Object.create(null), root.state),
    //     }),
    //   });
    //   return tree;
    // }

    proto.mount = function mountDev(...args) {
      mount.call(this, ...args);
      /**
       * A reference to a Component instance attached to its root element.
       *
       * @name $el.$yuzu
       * @type Component
       * @memberof Component
       */
      Object.defineProperty(this.$el as YuzuRoot, '$yuzu', {
        value: this,
        configurable: true,
      });

      // Object.defineProperty(this, '$$getTree', {
      //   enumerable: false,
      //   writable: false,
      //   value() {
      //     const tree = Object.create(null);
      //     return refTree(this, tree);
      //   },
      // });

      return this;
    };

    proto.destroy = function destroyDev() {
      const $el = this.$el as YuzuRoot | undefined;
      if ($el && $el.$yuzu) {
        delete $el.$yuzu;
      }
      delete this.$$logStart;
      delete this.$$logEnd;

      return destroy.call(this);
    };

    proto.init = function initDev(state?: IState) {
      Object.defineProperties(this, {
        /**
         * ```js
         * $$logStart([label], [event])
         * ```
         *
         * Will initialize an event logger with a custom label. By default will automatically log any change to the instance `state` property.
         *
         * ?> Note that event loggers will be not available until the instance is initialized
         *
         * @memberof Component
         * @param {string} [label] Log label. If not defined will fallback to: A `debugLabel` option, a static `displayName` property defined on the constructor, the component name
         * @param {string|boolean} [listen="change:*"] Event to listen for or `false`.
         */
        $$logStart: {
          enumerable: false,
          configurable: true,
          value(label = null, listen = 'change:*') {
            const name =
              label ||
              this.options.debugLabel ||
              `${this.constructor.displayName ||
                this.constructor.name ||
                'Component'}#${this.$uid}`;

            if (!this.$$logger) {
              this.$$logger = createStateLogger(name);
            }
            if (listen) {
              this.$$logger.subscribe(this, listen);
            }
          },
        },
        /**
         * ```js
         * $$logEnd([event])
         * ```
         *
         * Will stop an event logger either for a specific event or for every event.
         *
         * @memberof Component
         * @param {string} [event] Event to unsubscribe for. If not provided the logger will be completely stopped and removed
         */
        $$logEnd: {
          enumerable: false,
          configurable: true,
          value(event?: string) {
            if (this.$$logger) {
              if (event) {
                this.$$logger.unsubscribe(this, event);
                return;
              }
              this.$$logger.unsubscribeAll(this);
              this.$$logger = undefined;
            }
          },
        },
      });
      return init.call(this, state);
    };

    // @ts-ignore: Devtools Hooks
    if (window.__YUZU_DEVTOOLS_GLOBAL_HOOK__) {
      // @ts-ignore
      window.__YUZU_DEVTOOLS_GLOBAL_HOOK__.init(Component);
    }
  };

  /* eslint-enable no-param-reassign */
} else {
  devtools = (ComponentClass) => undefined;
}

export { devtools };
