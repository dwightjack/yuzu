import { qsa, datasetParser, isElement } from 'yuzu-utils';
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
  root: HTMLElement | string;
  id: string;
}

let idx = -1;
let childIdx = -1;

/**
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
 * We can register the component inside a sandbox like this:
 *
 * ```js
 * const sandbox = new Sandbox({
 *   components: [Counter],
 *   root: '#main', // (defaults to `document.body`)
 *   id: 'main', // optional
 * });
 *
 * sandbox.start();
 * ```
 *
 * In this way the sandbox will attach itself to the element matching `#main` and will traverse its children
 * looking for every `.Counter` element attaching an instance of the Counter component onto it.
 *
 * To prevent a component for being initialized (for example when you want to initialize it at a later moment)
 * just add a `data-skip` attribute to its root element.
 *
 * @class
 * @param {object} config
 * @param {Component[]|[Component, object][]} [config.components] Array of components constructor or array with [ComponentConstructor, options]
 * @param {HTMLElement|string} [config.root=document.body] Root element of the sandbox. Either a DOM element or a CSS selector
 * @param {string} [config.id] ID of the sandbox
 * @property {string} $id Sandbox internal id
 * @property {HTMLElement} $el Sandbox root DOM element
 * @property {Context} $ctx Internal [context](/packages/application/api/context). Used to share data across child instances
 * @property {object[]} $registry Registered components storage
 * @property {Map} $instances Running instances storage
 * @returns {Sandbox}
 */
export class Sandbox extends Component {
  public static UID_DATA_ATTR = 'data-sandbox';

  public static defaultOptions = () => ({
    components: [],
    id: `_sbx-${++idx}`,
    root: document.body,
  });

  public $id: string;

  public $ctx?: IContext;

  public $registry: ISandboxRegistryEntry[] = [];

  public $instances = new Map<typeof Component, Component[]>();

  /**
   * Creates a sandbox instance.
   *
   * @constructor
   */
  constructor(options: Partial<ISandboxOptions> = {}) {
    super(options);
    const { components = [], id } = this.options as ISandboxOptions;

    this.$id = id as string;

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
   * Registers a new component into the sandbox. The registered components
   * will be traversed on `.start()` initializing every matching component.
   *
   * @param {object} params Every property other than `component` and `selector` will be used as component option
   * @param {Component} params.component Component constructor
   * @param {string} params.selector Child component root CSS selector
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
   * The store will be available inside each component at `this.$context`.
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
    this.mount(this.options.root);
    if (!isElement(this.$el)) {
      throw new TypeError('this.$el is not a DOM element');
    }
    this.$el.setAttribute(Sandbox.UID_DATA_ATTR, this.$id);
    this.$ctx = createContext(data);
    this.$ctx.inject(this);
    this.emit('beforeStart');

    const sbSelector = `[${Sandbox.UID_DATA_ATTR}]`;

    const ret = this.$registry.map(
      async ({ component: ComponentConstructor, selector, ...options }) => {
        if (this.$instances.has(ComponentConstructor)) {
          console.warn(`Component ${ComponentConstructor} already initialized`); // tslint:disable-line no-console
          return;
        }
        const { $el } = this;
        const instances = qsa<HTMLElement>(selector, $el)
          .filter((el) => {
            return (
              !el.dataset.skip &&
              !el.closest('[data-skip]') &&
              el.closest(sbSelector) === $el
            );
          })
          .map((el) => {
            return this.createInstance(ComponentConstructor, options, el);
          });

        this.$instances.set(ComponentConstructor, await Promise.all(instances));
        return true;
      },
    );
    Promise.all(ret).then(() => this.emit('start'));

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

    return this.setRef({
      id: `_sbx-c${++childIdx}`,
      ...options,
      ...inlineOptions,
      component: ComponentConstructor,
      el,
    });
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
    await this.beforeDestroy();
    this.removeListeners();
    try {
      if (this.$el) {
        this.$el.removeAttribute(Component.UID_DATA_ATTR);
      }
      await this.destroyRefs();
      this.$active = false;
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
    this.$ctx = undefined; // release the context
    this.off('beforeStart');
    this.off('start');
    this.off('error');
    this.off('beforeStop');
    this.off('stop');
  }
}
