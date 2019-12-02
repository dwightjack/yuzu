import invariant from 'tiny-invariant';
import { datasetParser, isElement, evaluate, createSequence } from 'yuzu-utils';
import { IComponentConstructable } from 'yuzu/types';
import { Component } from 'yuzu';
import { createContext, IContext } from './context';

export type entrySelectorFn = (sbx: Sandbox<any>) => boolean | HTMLElement[];

export type sandboxComponentOptions = [
  IComponentConstructable<Component<any, any>>,
  Record<string, any>,
];

export interface ISandboxRegistryEntry {
  component: IComponentConstructable<Component<any, any>>;
  selector: string | entrySelectorFn;
  [key: string]: any;
}

export interface ISandboxOptions {
  components?: (
    | IComponentConstructable<Component<any, any>>
    | sandboxComponentOptions
  )[];
  root: HTMLElement | string;
  context: IContext<any>;
  id: string;
}

const nextSbUid = createSequence();
const nextChildUid = createSequence();

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
 *   id: 'main', // optional
 * });
 *
 * sandbox.mount('#main');
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
export class Sandbox<S = {}> extends Component<S, ISandboxOptions> {
  public static SB_DATA_ATTR = 'data-yuzu-sb';

  public defaultOptions(): ISandboxOptions {
    return {
      components: [],
      context: createContext(),
      id: '',
      root: document.body,
    };
  }
  public $id: string;
  public $ctx?: IContext;

  public $registry: ISandboxRegistryEntry[] = [];

  public $instances = new Map<
    string | entrySelectorFn,
    Component<any, any>[]
  >();

  /**
   * Creates a sandbox instance.
   *
   * @constructor
   */
  public constructor(options: Partial<ISandboxOptions> = {}) {
    super(options);
    const { components = [], id } = this.options;

    this.$id = id || nextSbUid('_sbx-');

    components.forEach((config) => {
      if (!Array.isArray(config)) {
        if (config.root) {
          this.register({ component: config, selector: config.root });
        }
        if (process.env.NODE_ENV !== 'production') {
          !config.root &&
            this.$warn(
              `Skipping component ${config.displayName ||
                config.name} because static "root" selector is missing`,
            );
        }
      } else {
        const [component, params = {}] = config;
        const selector = component.root || params.selector;
        if (selector) {
          this.register({ component, selector, ...params });
        }
        if (process.env.NODE_ENV !== 'production') {
          !selector &&
            this.$warn(
              `Skipping component ${component.displayName ||
                component.name} because a static "root" selector is missing and no "selector" param is passed-in`,
            );
        }
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
   * will be traversed on `.mount()` initializing every matching component.
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
  public register<C extends Component<any, any>>(params: {
    component: IComponentConstructable<C>;
    selector: string | entrySelectorFn;
    [key: string]: any;
  }): void {
    invariant(
      Component.isComponent(params.component),
      'Missing or invalid `component` property',
    );

    invariant(
      typeof params.selector === 'string' ||
        typeof params.selector === 'function',
      'Missing `selector` property',
    );

    this.$registry.push(params);
  }

  /**
   * ```js
   * start([data])
   * ```
   *
   * **DEPRECATED!** Use `sandbox.mount(root)` instead.
   *
   * Starts the sandbox with an optional context.
   *
   * The store will be available inside each component at `this.$context`.
   *
   * @deprecated
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
  public start(data = {}): this {
    Object.defineProperty(this, '$legacyStart', { value: true });

    if (process.env.NODE_ENV !== 'production') {
      this.$warn(`Sandbox.start is deprecated. Use the "mount" method instead`);
    }
    this.mount(this.options.root);
    this.setup();
    this.$ctx && this.$ctx.update(data);
    this.discover();
    return this;
  }

  /**
   * ```js
   * mount([el], [state])
   * ```
   *
   * Enhances `Component.mount()` by firing the child components discovery logic.
   * By default will use `document.body` as mount element.
   *
   * @param {string|Element} el Component's root element
   * @param {object|null} [state={}] Initial state
   * @fires Sandbox#beforeStart
   * @fires Sandbox#start Events dispatched after all components are initialized
   * @returns {Sandbox}
   */
  public mount(el: string | Element, state: Partial<S> | null = {}): this {
    super.mount(el, state);
    this.$el.setAttribute(Sandbox.SB_DATA_ATTR, '');
    if (!this.hasOwnProperty('$legacyStart')) {
      this.setup();
      this.discover();
    }
    return this;
  }

  /**
   * Setups the sandbox context passed in the options.
   *
   * @ignore
   */
  public setup(): void {
    this.$ctx = this.options.context;
    this.$ctx.inject(this);
  }

  /**
   * Initializes the sandbox child components.
   *
   * @ignore
   * @returns {Promise}
   */
  public discover(): Promise<void> {
    invariant(isElement(this.$el), '"this.$el" is not a DOM element');

    this.emit('beforeStart');

    const sbSelector = `[${Sandbox.SB_DATA_ATTR}]`;

    const ret = this.$registry.map(
      async ({ component: ComponentConstructor, selector, ...options }) => {
        if (this.$instances.has(selector)) {
          this.$warn(
            `Component ${ComponentConstructor} already initialized on ${selector}`,
          );
          return;
        }
        const targets = this.resolveSelector(selector);
        let instances: Promise<Component<any, any>>[] | undefined;
        if (targets === true) {
          instances = [this.createInstance(ComponentConstructor, options)];
        } else if (Array.isArray(targets)) {
          const { $el } = this;
          instances = targets
            .filter((el) => {
              return (
                isElement(el) &&
                !el.dataset.skip &&
                !el.closest('[data-skip]') &&
                el.closest(sbSelector) === $el
              );
            })
            .map((el) => {
              return this.createInstance(ComponentConstructor, options, el);
            });
        }

        if (instances) {
          this.$instances.set(selector, await Promise.all(instances));
        }
        return true;
      },
    );
    return Promise.all(ret).then(() => {
      this.emit('start');
    });
  }

  /**
   * Resolves a configured component selector to a list of DOM nodes or a boolean (for detached components)
   *
   * @ignore
   * @param {string|function} selector Selector string or function.
   * @returns {HTMLElement[]|boolean}
   */
  public resolveSelector(
    selector: string | entrySelectorFn,
  ): HTMLElement[] | boolean {
    let targets = evaluate(selector, this);
    if (typeof targets === 'string') {
      targets = this.findNodes(targets) as HTMLElement[];
    }
    return targets;
  }

  /**
   * Creates a component instance.
   * Reads inline components from the passed-in root DOM element.
   *
   * @ignore
   * @param {object} options instance options
   * @param {HTMLElement} [el] Root element
   * @returns {Component}
   */
  public createInstance<C extends Component<any, any>>(
    ComponentConstructor: IComponentConstructable<C>,
    options: Record<string, any>,
    el?: HTMLElement,
  ): Promise<C> {
    const inlineOptions = el ? datasetParser(el) : {};

    return this.setRef({
      id: nextChildUid(this.$id + '-c.'),
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
   * **DEPRECATED!** Use `sandbox.destroy()` instead.
   *
   * Stops every running component, clears sandbox events and destroys the instance.
   *
   * @deprecated
   * @fires Sandbox#beforeStop
   * @fires Sandbox#stop
   * @returns {Promise<void>}
   * @example
   * sandbox.stop();
   */
  public async stop(): Promise<void> {
    if (process.env.NODE_ENV !== 'production') {
      this.$warn(
        `Sandbox.stop is deprecated. Use the "destroy" method instead`,
      );
    }

    return this.destroy();
  }

  /**
   * ```js
   * destroy()
   * ```
   *
   * Enhances `Component.destroy()`.
   * Stops every running component, clears sandbox events and destroys the instance.
   *
   * @deprecated
   * @fires Sandbox#beforeStop
   * @fires Sandbox#stop
   * @returns {Promise<void>}
   * @example
   * sandbox.destroy();
   */
  public async destroy(): Promise<void> {
    this.emit('beforeStop');
    await this.beforeDestroy();
    this.removeListeners();
    try {
      if (this.$el) {
        this.$el.removeAttribute(Sandbox.SB_DATA_ATTR);
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

    return super.destroy();
  }

  /**
   * Removes events and associated store
   *
   * @ignore
   */
  public clear(): void {
    this.$ctx = undefined; // release the context
    this.off('beforeStart');
    this.off('start');
    this.off('error');
    this.off('beforeStop');
    this.off('stop');
  }
}
