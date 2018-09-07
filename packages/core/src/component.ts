import dush, { Idush } from 'dush';

import {
  nextUid,
  isElement,
  isPlainObject,
  evaluate,
  bindMethod,
  qs,
} from '@yuzu/utils';

import {
  IObject,
  IState,
  fn,
  IListener,
  IRefConstructor,
  IRefInstance,
  IRefFactory,
  eventHandlerFn,
  stateUpdaterFn,
  ReadyStateFn,
} from '../types';

const UID_DATA_ATTR = 'data-cid';

const LISTENER_REGEXP = /^([^ ]+)(?: (.+))?$/;

// tslint:disable-next-line: interface-name no-empty-interface
export interface Component extends Idush {}

/**
 * `Component` is an extensible class constructor which provides the building block of Yuzu component system.
 * @class
 */
export class Component implements Idush {
  public static root?: string;

  /**
   * Returns an object with default options
   *
   * @static
   * @returns {object}
   */
  public static defaultOptions = (): IObject => ({});

  /**
   * Checks whether the passed-in value is a Component constructor
   *
   * @static
   * @param {*} value
   * @returns {boolean}
   */
  public static isComponent(value: any): value is typeof Component {
    if (!value || !value.defaultOptions) {
      return false;
    }
    return typeof value.defaultOptions === 'function';
  }

  public options: IObject;

  public $active: boolean;

  public $el!: Element;
  public $uid!: string;
  public $els: { [key: string]: Element | null };
  public $refs: { [key: string]: Component };
  public state: IState;
  public $context?: IObject;

  public selectors?: IObject<string>;
  public listeners?: IObject<string | eventHandlerFn>;
  public actions?: IObject<string | fn>;

  public $refsStore: Map<string, Component>;
  public $listeners: Map<eventHandlerFn, IListener>;
  public readyState?: ReadyStateFn;

  /**
   * Component constructor
   *
   * Lifecycle stage: `create`
   *
   * Lifecycle hooks:
   *
   * - `created`
   *
   * @param {object} [options={}] Instance options
   * @returns {Component}
   */
  constructor(options: IObject = {}) {
    const defaultOptionsFn = (this.constructor as typeof Component)
      .defaultOptions;

    const defaultOptions =
      typeof defaultOptionsFn === 'function'
        ? defaultOptionsFn.call(this, this)
        : {};

    this.state = {};

    this.options = Object.entries(defaultOptions).reduce(
      (opts: IObject, [key, value]) => {
        let v = options[key] !== undefined ? options[key] : value;
        if (typeof v === 'function') {
          v = v.bind(this);
        }
        opts[key] = v; // eslint-disable-line no-param-reassign
        return opts;
      },
      {},
    );

    Object.assign(this, dush());

    this.$active = false;

    // DOM references
    this.$els = {};

    // sub components references
    this.$refs = {};
    this.$refsStore = new Map();

    this.$listeners = new Map();

    this.created();
  }

  /**
   * Mounts a component's instance on a DOM element and initializes it.
   * To prevent this second behavior set `state` to `null`
   *
   * Lifecycle stage: `mount`
   *
   * Lifecycle hooks:
   *
   * - `beforeMount` just after attaching the root element (this.$el) but before any listener and selector registration
   * - `initialize` (if `state` !== null)
   * - `ready` (if `state` !== null)
   * - `mounted`
   *
   * @param {string|Element} el Component's root element
   * @param {object|null} [state={}] initial state
   * @returns {Component}
   */
  public mount(el: string | Element, state: IState | null = {}) {
    if (this.$el) {
      throw new Error('Component is already mounted');
    }

    const $el = typeof el === 'string' ? qs(el) : el;

    if (!isElement($el)) {
      // fail silently (kinda...);
      console.warn('Element is not a DOM element', $el); // tslint:disable-line no-console
      return this;
    }

    this.$el = $el; // eslint-disable-line no-multi-assign

    this.beforeMount();

    if (this.selectors) {
      Object.entries(this.selectors).forEach(([key, selector]) => {
        this.$els[key] = qs(selector, this.$el);
      });
    }

    if (this.listeners) {
      Object.entries(this.listeners).forEach(([def, handler]) => {
        this.setListener(def, bindMethod(this, handler));
      });
    }

    if (state) {
      this.init(state);
    }

    this.mounted();

    return this;
  }

  /**
   * Initializes the component instance
   *
   * Lifecycle stage: `init`
   *
   * Lifecycle hooks:
   *
   * - `initialize` (if `state` !== null)
   * - `ready` (if `state` !== null)
   *
   * @param {object|null} [state={}] initial state
   * @returns {Component}
   */
  public init(state: IState = {}) {
    if (!isElement(this.$el)) {
      throw new Error('component instance not mounted');
    }
    const { $el } = this;

    // initialization placeholder
    let uid = $el.getAttribute(UID_DATA_ATTR);

    if (uid) {
      console.warn(`Element ${uid} is already initialized... skipping`, $el); // tslint:disable-line no-console
      this.$uid = uid;

      return this;
    }

    uid = nextUid();
    this.$uid = uid;

    $el.setAttribute(UID_DATA_ATTR, uid);

    if (!$el.id) {
      $el.id = `c_${uid}`;
    }

    this.initialize();

    if (this.actions) {
      Object.entries(this.actions).forEach(([key, method]) => {
        this.on(`change:${key}`, bindMethod(this, method));
      });
    }

    const initialState = Object.assign(this.state, state);
    this.replaceState(initialState);

    this.$active = true;

    if (this.readyState) {
      // is it a promise ?
      const watcher = (current: IState, prev: IState) => {
        if ((this.readyState as ReadyStateFn)(current, prev)) {
          this.off('change:*', watcher);
          this.ready();
        }
      };
      this.on('change:*', watcher);
      return this;
    }

    this.ready();

    return this;
  }

  /**
   * Lifecycle hook called on instance creation
   */
  public created() {} // tslint:disable-line: no-empty

  /**
   * Lifecycle hook called just before mounting the instance onto the root element
   */
  public beforeMount() {} // tslint:disable-line: no-empty

  /**
   * Lifecycle hook called when the instance gets mounted onto a DOM element
   */
  public mounted() {} // tslint:disable-line: no-empty

  /**
   * Lifecycle hook called before instance initialization.
   */
  public initialize() {} // tslint:disable-line: no-empty

  /**
   * Lifecycle hook called after instance initialization. State and event binding are already in place
   */
  public ready() {} // tslint:disable-line: no-empty

  /**
   * Lifecycle hook called just before closing child refs
   */
  public beforeDestroy() {} // tslint:disable-line: no-empty

  /**
   * Returns a state property
   *
   * @param {string} key State property to return
   * @returns {*}
   * @example
   * const instance = new Component().mount('#app', { a: 1 });
   * // instance.getState('a') === 1
   */
  public getState(key: string) {
    return this.state[key];
  }

  /* eslint-disable class-methods-use-this */
  /**
   * Executes a strict inequality comparison (`!==`) on the passed-in values and returns the result.
   * This method is executed on `setState` calls.
   *
   * You can overwrite this method with your own validation logic
   *
   * @param {string} key State property name
   * @param {*} currentValue value stored in the current state
   * @param {*} newValue New value
   * @returns {boolean}
   */
  public shouldUpdateState(key: string, currentValue: any, newValue: any) {
    return currentValue !== newValue;
  }
  /* eslint-enable class-methods-use-this */

  /**
   * Sets internal state property(ies). Creates a shallow copy of the current state.
   * If the computed new state is different from the old one it emits a `change:<property>` event for every changed property
   * as well as a `change:*` event
   *
   * To prevent this behavior set the second argument to `true` (silent update)
   *
   * If the new value argument is a function, it will be executed with the current state as argument.
   * The returned value will be used to update the state.
   *
   * @param {object|function} updater Defines which part of the state must be updated. If a string it define the state property name
   * @param {boolean} [silent=false] Update the state without emitting change events
   * @example
   * instance.on('change:a', (next, prev) => console.log(next, prev));
   * instance.setState({ a: 1 }); //emits 'change:a' -> logs undefined,1
   *
   * instance.setState({ a: 1 }); //nothing happens
   * instance.setState({ a: 2 }, true); //nothing happens, again...
   *
   * // use the current state to calculate its next value
   * instance.setState(({ a }) => ({a + 1}));
   */
  public setState<T extends IState = IState>(
    updater: Partial<T> | stateUpdaterFn<T>,
    silent = false,
  ) {
    const changed: string[] = [];
    const { state: prevState } = this;

    const changeSet = evaluate(updater as stateUpdaterFn<T>, this.state);

    this.state = Object.entries(this.state).reduce(
      (newState: IState, [k, prevValue]) => {
        const value = changeSet[k];
        if (
          value === undefined ||
          this.shouldUpdateState(k, prevValue, value) === false
        ) {
          newState[k] = prevValue; // eslint-disable-line no-param-reassign
        } else {
          changed.push(k);
          newState[k] = value; // eslint-disable-line no-param-reassign
        }
        return newState;
      },
      {},
    );

    if (!silent && changed.length > 0) {
      while (changed.length !== 0) {
        const k = changed.pop() as string;
        this.emit(`change:${k}`, this.state[k], prevState[k]);
      }
      this.emit('change:*', this.state, prevState);
    }
  }

  public replaceState(newState: IState, silent = false) {
    const { state: prevState } = this;
    this.state = Object.assign({}, newState);
    Object.entries(this.state).forEach(([key, value]) => {
      if (!silent) {
        this.emit(`change:${key}`, value, prevState[key]);
      }
    });
    if (!silent) {
      this.emit('change:*', this.state, prevState);
    }
  }

  /**
   * Emits a `broadcast:<eventname>` event to every child component listed as a `$ref`
   *
   * @param {string} event Event name
   * @param {*[]} [params] Additional arguments to pass to the handler
   * @example
   * const child = new Component('#child');
   * child.on('broadcast:log', (str) => console.log(str));
   *
   * instance.setRef({ id: 'child', component: child });
   * instance.broadcast('log', 'test') // child component logs 'test'
   */
  public broadcast(event: string, ...params: any[]) {
    const values = [...this.$refsStore.values()];

    while (values.length > 0) {
      const ref = values.pop() as Component;
      ref.emit(`broadcast:${event}`, ...params);
    }
  }

  /**
   * Sets a DOM event listener
   *
   * @param {string} def Event and target element definition
   * @param {function} handler Event handler
   */
  public setListener(def: string, handler: eventHandlerFn) {
    let event;
    let selector;
    const match = def && def.match(LISTENER_REGEXP);
    if (match) {
      const $el = this.$el;
      [, event, selector = $el] = match;
      let element;

      if (typeof selector === 'string') {
        element = selector.startsWith('@')
          ? this.$els[selector.slice(1)]
          : qs(selector, $el);
      } else {
        element = selector;
      }

      if (element) {
        element.addEventListener(event, handler);
        this.$listeners.set(handler, { event, element });
      }
    }
  }

  /**
   * Removes all DOM event listeners attached with `.setListener`
   *
   */
  public removeListeners() {
    this.$listeners.forEach(({ event, element }, handler) => {
      element.removeEventListener(event, handler);
    });
    this.$listeners.clear();
  }

  /**
   * Attaches a reference to a child component.
   * If a reference `id` is already attached, the previous one is destroyed and replaced with the new one
   *
   * @param {object} refCfg A child component configuration object
   * @param {string} refCfg.id Reference id. Will be used to set a reference to the child component onto `this.$refs`
   * @param {component} refCfg.component Component constructor or component instance
   * @param {string|HTMLElement} refCfg.el Child component root element. Ignored if `refCfg.component` is a component instance
   * @param {Object} refCfg.on Child component event listeners. Format `{ 'eventname': handler }`
   * @param {*} refCfg.* Any other property listed here will be passed to the constructor as option
   * @param {object} [props] Child component initial state.
   * @returns {Promise}
   * @example
   * const parent = new Component('#root');
   *
   * class ChildComponent extends Component {}
   *
   * // as constructor
   * parent.setRef({
   *   id: 'child',
   *   component: ChildComponent,
   *   el: '#child',
   *   // other options here...
   * });
   *
   * // as instance
   * parent.setRef({
   *   id: 'child',
   *   component: new ChildComponent({ ... }).mount('#child', null) // <-- prevent component init
   * });
   *
   * // sync parent - child state
   * // updates child `parentCount` state whenever `parent.state.count` changes
   * parent.setRef({
   *   id: 'child',
   *   component: ChildComponent,
   *   el: '#child',
   *   // other options here...
   * }, {
   *   parentCount: (parentState) => parentState.count
   * });
   */
  public async setRef(
    refCfg:
      | IRefConstructor<typeof Component>
      | IRefInstance<Component>
      | IRefFactory<Component>,
    props?: IState,
  ) {
    let ref: Component;
    if (!isPlainObject(refCfg)) {
      throw new TypeError('Invalid reference configuration');
    }

    const { component: ChildComponent, el, id, on, ...options } = refCfg;

    if (Component.isComponent(ChildComponent) && el) {
      ref = new ChildComponent(options);
    } else if (ChildComponent instanceof Component) {
      ref = ChildComponent;
    } else if (typeof ChildComponent === 'function' && el) {
      ref = (ChildComponent as IRefFactory<Component>['component'])(
        el,
        this.state,
      );
    } else {
      throw new TypeError('Invalid reference configuration');
    }

    // $context gets propagated to every child component
    // this way we can use `connect`-ed components as reference
    if (this.$context) {
      Object.defineProperty(ref, '$context', {
        enumerable: false,
        get: () => this.$context,
      });
    }

    if (!id) {
      throw new Error('Invalid reference id string');
    }

    // bind events...
    if (on) {
      Object.entries(on).forEach(([name, handler]) => {
        ref.on(name, handler);
      });
    }

    const { $refs } = this;
    const prevRef = $refs[id];
    const refState: IState = {};
    $refs[id] = ref;
    this.$refsStore.set(id, ref);

    if (!ref.$el && el) {
      ref.mount(el, null);
    }

    if (props) {
      Object.entries(props).forEach(([name, value]) => {
        if (typeof value === 'function') {
          let key = name;
          let src = '*';
          if (name.includes('>')) {
            [src = '*', key] = name.split('>');
          }
          refState[key] = value(
            src !== '*' ? this.state[src] : this.state,
            ref,
          );
          this.on(`change:${src}`, (state) => {
            ref.setState({ [key]: value(state, ref) });
          });
        } else {
          refState[name] = value;
        }
      });
    }
    const { $el } = this;

    if (prevRef) {
      await prevRef.destroy();
      if (
        prevRef.$el &&
        $el.contains(prevRef.$el) &&
        prevRef.$el.parentElement &&
        ref.$el
      ) {
        prevRef.$el.parentElement.replaceChild(ref.$el, prevRef.$el);
      } else if (ref.$el && !$el.contains(ref.$el)) {
        $el.appendChild(ref.$el);
      }
      return ref.init(refState);
    }

    if (ref.$el && !$el.contains(ref.$el)) {
      $el.appendChild(ref.$el);
    }
    return ref.init(refState);
  }

  /**
   * Calls `.destroy()` on every child references and detaches them from the parent component.
   *
   * @returns {Promise}
   */
  public async closeRefs() {
    const { $refsStore } = this;

    try {
      const result = await Promise.all(
        [...$refsStore.values()].map((ref) => ref.destroy()),
      );
      this.$refs = {};
      $refsStore.clear();
      return result;
    } catch (e) {
      console.error('close refs', e); // tslint:disable-line no-console
      return Promise.reject(e);
    }
  }

  /**
   * Detaches DOM events, instance's events and destroys all references as well
   *
   * Lifecycle stage: `destoy`
   *
   * Lifecycle hooks:
   *
   * - `beforeDestroy`
   *
   * @returns {Promise}
   */
  public async destroy() {
    await this.beforeDestroy();
    this.removeListeners();
    this.off();
    if (this.$el) {
      this.$el.removeAttribute(UID_DATA_ATTR); // eslint-disable-line no-console
    }

    try {
      await this.closeRefs();
      this.$active = false;

      return Promise.resolve();
    } catch (e) {
      console.error('destroy catch: ', e); // tslint:disable-line no-console
      return Promise.reject(e);
    }
  }
}
