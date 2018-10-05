import dush, { Idush } from 'dush';
import { qsa, qs, isElement, datasetParser } from 'yuzu-utils';
import { IObject } from 'yuzu/types';
import { Component } from 'yuzu';
import { createContext, IContext } from './context';

export type sandboxComponentOptions = [
  typeof Component,
  { [key: string]: any }
];

export interface ISandboxRegistryEntry {
  component: typeof Component;
  selector: string;
  [key: string]: any;
}

export interface ISandboxOptions {
  components?: Array<(typeof Component) | sandboxComponentOptions>;
  root?: HTMLElement | string;
  id?: string;
}

let idx = -1;

/**
 * ## Sandbox
 *
 * A sandbox can be used to initialize a set of components based on an element's innerHTML.
 *
 * Lets say we have the following component:
 *
 * ```js
 * class Counter extends Component {
 *   static root = '.Counter';
 *
 *   // other stuff here ...
 * }
 * ```
 *
 * We can register the component inside a sandbox like this
 *
 * ```js
 * const sandbox = new Sandbox({
 *   components: [Counter],
 *   root: '#main' // (defaults to `document.body`),
 *   id: 'main' // optional
 * })
 *
 * sandbox.start()
 * ```
 *
 * In this way the sandbox will attach itself to the element matching `#main` and will traverse its children
 * looking for every `.Counter` element attaching an instance of the Counter component onto it.
 *
 * To prevent a component for being initialized (for example when you want to initialize it at a later moment)
 * just add a data-skip attribute to it's root element
 *
 */

// tslint:disable-next-line: interface-name no-empty-interface
export interface Sandbox extends Idush {}

/**
 * Components' container
 * @class
 * @param {object} config
 * @param {Component[]|[Component, object][]} [config.components] Array of: components constructor or array with [ComponentConstructor, option]
 * @param {HTMLElement|string} [config.root=document.body] Root element of the sandbox. Either a dom element
 * @param {string} [config.id] ID of the sandbox
 * @property {string} $id Sandbox internal id
 * @property {HTMLElement} $root Sandbox root DOM element
 * @property {Context} $context Internal [context](/packages/application/api/context/). Used to share data across child instances
 * @property {object[]} $registry Registered components storage
 * @property {Map} $instances Running instances storage
 * @returns {Sandbox}
 * @example
 * const sandbox = new Sandbox({
 *  id: 'application',
 *  el: '#app',
 *  components: [Counter, [Navigation, { theme: 'dark' }]]
 * });
 *
 * sandbox.start()
 */
export class Sandbox implements Idush {
  public static UID_DATA_ATTR = 'data-sandbox';

  public $id: string;

  public $root!: Element;

  public $context?: IContext;

  public $registry: ISandboxRegistryEntry[] = [];

  public $instances = new Map<typeof Component, Component[]>();

  /**
   * Creates a sandbox instance.
   *
   * @constructor
   */
  constructor(options: ISandboxOptions = {}) {
    const { components = [], root = document.body, id } = options;

    Object.assign(this, dush());

    this.$id = id || `_sbx-${++idx}`; // eslint-disable-line no-plusplus

    const $root = typeof root === 'string' ? qs(root) : root;

    if (!isElement($root)) {
      throw new Error(
        `Unable to initialize the sandbox on the following element: ${root}`,
      );
    }

    this.$root = $root;

    $root.setAttribute(Sandbox.UID_DATA_ATTR, this.$id);

    components.forEach((config) => {
      if (!Array.isArray(config)) {
        this.register({ component: config, selector: config.root });
      } else {
        const [component, params = {}] = config;
        this.register({ component, selector: component.root, ...params });
      }
    });

    return this;
  }

  /**
   * ```js
   * register(params)
   * ```
   *
   * Registers a new component into the sandbox. The register will be traversed on `.start()`
   * Initializing every matching component
   *
   * @param {object} params
   * @param {Component} params.component Component constructor
   * @param {string} params.selector Child component root CSS selector
   * @param {*} params.* Every other property will be used as component option
   * @example
   * sandbox.register({
   *   component: Counter,
   *   selector: '.Counter',
   *   theme: 'dark' // <-- instance options
   * });
   */
  public register(
    params: {
      component?: typeof Component;
      selector?: string;
      [key: string]: any;
    } = {},
  ) {
    if (!Component.isComponent(params.component)) {
      throw new TypeError('Missing or invalid `component` property');
    }
    if (typeof params.selector !== 'string') {
      throw new TypeError('Missing `selector` property');
    }
    this.$registry.push(params as ISandboxRegistryEntry);
  }

  /**
   * ```js
   * start([data])
   * ```
   *
   * Starts the sandbox with an optional context.
   *
   * The store will be available inside a component at `this.$context`
   *
   * @param {object} [data] Optional context data object to be injected into the child components.
   * @fires Sandbox#beforeStart
   * @fires Sandbox#start Events dispatched after all components are initialized
   * @returns {Sandbox}
   * @example
   * sandbox.start();
   *
   * // with context data
   * sandbox.start({ globalTheme: 'dark' });
   */
  public start(data = {}): Sandbox {
    this.$context = createContext(data);
    this.emit('beforeStart');

    const sbSelector = `[${Sandbox.UID_DATA_ATTR}]`;

    this.$registry.forEach(
      ({ component: ComponentConstructor, selector, ...options }) => {
        if (this.$instances.has(ComponentConstructor)) {
          console.warn(`Component ${ComponentConstructor} already initialized`); // tslint:disable-line no-console
          return;
        }
        const { $root } = this;
        const instances = qsa(selector, $root).reduce(
          (acc: Component[], el) => {
            if (
              !el.dataset.skip &&
              !el.closest('[data-skip]') &&
              el.closest(sbSelector) === this.$root
            ) {
              const instance = this.createInstance(
                ComponentConstructor,
                options,
                el,
              );

              acc.push(instance);
            }
            return acc;
          },
          [],
        );

        this.$instances.set(ComponentConstructor, instances);
      },
    );
    this.emit('start');

    return this;
  }

  /**
   * Creates a component instance.
   * Reads inline components from the passed-in root DOM element.
   *
   * @private
   * @param {object} options instance options
   * @param {Element} el Root element
   * @returns {Component}
   */
  public createInstance(
    ComponentConstructor: typeof Component,
    options: IObject,
    el: HTMLElement,
  ) {
    const inlineOptions = datasetParser(el);
    const instance = new ComponentConstructor({
      ...options,
      ...inlineOptions,
    });

    if (this.$context) {
      this.$context.inject(instance);
    }

    return instance.mount(el);
  }

  /**
   * ```js
   * stop()
   * ```
   *
   * Stops every running component and clears sandbox events.
   *
   * @fires Sandbox#beforeStop
   * @fires Sandbox#stop
   * @returns {Promise<void>}
   * @example
   * sandbox.stop();
   */
  public async stop() {
    this.emit('beforeStop');

    try {
      const maps: Array<Promise<void>> = [];
      const groups = Array.from(this.$instances.values());
      for (let i = 0, l = groups.length; i < l; i += 1) {
        const instances = groups[i];
        instances.forEach((instance) => {
          maps.push(instance.destroy());
        });
      }
      await Promise.all(maps);
    } catch (e) {
      this.emit('error', e);
      return Promise.reject(e);
    }

    this.$instances.clear();

    this.emit('stop');
    this.clear();

    return Promise.resolve();
  }

  /**
   * Removes events and associated store
   *
   * @private
   */
  public clear() {
    this.$context = undefined; // release the context
    this.off('beforeStart');
    this.off('start');
    this.off('error');
    this.off('beforeStop');
    this.off('stop');
  }
}
