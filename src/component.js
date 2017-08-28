// @flow
import dush from 'dush';
import type { dushInstance } from 'dush';
import { qs } from 'tsumami';
import { EventManager } from 'tsumami/lib/events';
import { nextUid, isElement, isPlainObject, extend } from './utils';

const defineProperty = Object.defineProperty;
const getOwnPropertyNames = Object.getOwnPropertyNames;
const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

const UID_DATA_ATTR = 'data-yzid';

/**
 * @class
 */
export default class Component {

    el: Element;

    /**
     * Root element
     */
    $el: Element;

    /**
     * Map of child elements reference
     *
     * @type {Object.<String,Element>}
     */
    $els: {[element_id: string]: Element};

    /**
     * Map of references to child components
     *
     * @type {Object.<Component,Element>}
     * @see {@link #setRef}
     */
    $refs: {[ref_id: string]: Component};

    /**
     * @private
     */
    _$refsKeys: string[];

    /**
     * Component options
     */
    options: optionsType;

    /**
     * DOM event manager
     *
     * @see {@link https://github.com/dwightjack/tsumami/blob/master/doc/events.md#eventmanager}
     */
    $ev: EventManager;

    /**
     * Component state
     *
     * @type {Object.<string, any>}
     */
    state: stateType;
    ctx: Component;

    /**
     * @private
     */
    _uid: string;

    /**
     * @private
     */
    _active: boolean;

    /**
     * Attaches an event handler
     *
     * @type function
     * @see https://github.com/charlike/dush#on
     * @example
     * instance.on('myevent', (param) => {
     *  ...
     * });
     */
    on: dushInstance.on;

    /**
     * Removes an event handler
     *
     * @type function
     * @see https://github.com/charlike/dush#off
     * @example
     *
     * const handler = (param) => { ... };
     *
     * //attach an event handler
     * instance.on('myevent', handler);
     *
     * //remove it
     * instance.off('myevent', handler);
     */
    off: dushInstance.off;

    /**
     * Attaches a one-time event handler
     *
     * @type function
     * @see https://github.com/charlike/dush#once
     * @example
     * const handlerOnce = (param) => { ... };
     *
     * //attach an event handler
     * instance.once('myevent', handlerOnce)
     */
    once: dushInstance.once;

    /**
     * Emits an event
     *
     * @type function
     * @see https://github.com/charlike/dush#emit
     * const handler = (...params) => { console.log(params); };
     *
     * //attach an event handler
     * instance.on('log', handler);
     *
     * instance.emit('log', 'test', 1); //logs ['test', 1]
     */
    emit: dushInstance.emit;

    use: dushInstance.use;
    _allEvents: dushInstance._allEvents;

    /**
     * Returns a new Component constructor with optional proptotype and static methods
     *
     * For usage in ES5 environments. In ES2015+ you can extend the `Component` class itself.
     * @example
     * var ChildComponent = Component.create({
     *      myMethod: function () {
     *          return this.options.str
     *      }
     * }, {
     *      myStatic: function () {
     *          return 'a string';
     *      }
     * });
     *
     * ChildComponent.myStatic(); // returns 'a string'
     *
     * var child = new ChildComponent('.child', { str: 'demo' });
     * child.init();
     *
     * child.myMethod(); // returns 'demo'
     */
    //adapted from https://github.com/jashkenas/backbone/blob/master/backbone.js#L2050
    static create(obj?: { [string]: any}, statics?: { [string]: any}) {

        const props = obj || {};
        const parent: Function = this;
        const child = props.hasOwnProperty('constructor') ? props.constructor : function ChildConstructor() { //eslint-disable-line no-prototype-builtins
            return parent.apply(this, arguments); //eslint-disable-line prefer-rest-params
        };

        //https://github.com/mridgway/hoist-non-react-statics/blob/master/index.js#L51
        const keys = getOwnPropertyNames(parent);
        for (let i = 0; i < keys.length; ++i) { //eslint-disable-line no-plusplus
            const key = keys[i];
            const descriptor = getOwnPropertyDescriptor(parent, key);
            try { // Avoid failures from read-only properties
                defineProperty(child, key, descriptor);
            } catch (e) { } //eslint-disable-line no-empty
        }


        child.prototype = extend(Object.create(parent.prototype), props);
        child.prototype.constructor = child;

        child.__super__ = parent.prototype;

        if (isPlainObject(statics)) {
            extend(child, statics);
        }

        return child;
    }

    constructor(el?: RootElement, options?: optionsType = {}) {

        extend(this, dush());

        this._active = false;

        //DOM references
        this.$els = {};

        //sub components references
        this.$refs = {};
        this._$refsKeys = [];

        this.options = extend(this.getDefaultOptions(), options);

        this.$ev = new EventManager();

        this.state = {};

        this.created();

        if (el) {
            this.mount(el);
        }
    }

    /**
     * Mounts the compontent instance onto a DOM element
     *
     * @example
     * const instance = new Component();
     *
     * instance.mount('#app');
     * //instance.$el.id === 'app'
     */
    mount(el: RootElement) {

        if (this.$el) {
            throw new Error('Component is already mounted');
        }

        this.el = this.$el = typeof el === 'string' ? qs(el) : el; //eslint-disable-line no-multi-assign

        if (!isElement(this.$el)) {
            //fail silently (kinda...);
            console.warn('Element is not a DOM element', this.$el); //eslint-disable-line no-console
            return this;
        }

        this.mounted();

        return this;
    }

    /**
     * Initializes a component instance with optional state
     *
     * @param {Object} [state]
     *
     * @example
     * const instance = new Component('#app');
     * instance.init({ a: 1 });
     * instance.getState('a'); // 1
     */
    init(state?: stateType = {}): Component {

        const { $el } = this;

        if (!isElement($el)) {
            throw new Error('component instance not mounted');
        }

        //initialization placeholder
        let uid: ?string = $el.getAttribute(UID_DATA_ATTR);

        if (uid) {
            console.warn(`Element ${uid} is already initilized... skipping`, $el); //eslint-disable-line no-console
            this._uid = uid;
            return this;
        }

        uid = nextUid();
        this._uid = uid;

        $el.setAttribute(UID_DATA_ATTR, uid);

        if (!$el.id) {
            $el.id = `yuzu${uid}`;
        }

        this.beforeInit();

        const stateEventsMap = this.bindStateEvents();
        Object.keys(stateEventsMap).forEach((key) => {
            // $FlowFixMe
            const method: Function = typeof stateEventsMap[key] === 'string' && typeof this[stateEventsMap[key]] === 'function' ? this[stateEventsMap[key]] : stateEventsMap[key];
            this.on('change:' + key, method.bind(this));
        });

        const initialState = extend(this.getInitialState(), state);
        Object.keys(initialState).forEach((key) => {
            this.setState(key, initialState[key]);
        });

        this._active = true;

        this.afterInit();

        return this;
    }

    /**
     * Returns an event binding configuration object to be used during initialization.
     *
     * Object values can be either a function or a string pointing to an instance's method
     *
     * @example
     * class Child extends Component {
     *  bindStateEvents() {
     *      return { a: (a) => console.log(`value is ${a}`) }
     *  }
     * }
     *
     * const instance = new Child('#app').init();
     *
     * instance.setState('a', 1); //logs: value is 1
     *
     */
    bindStateEvents(): { [event_id: string]: Function | string } { //eslint-disable-line class-methods-use-this
        return {};
    }

    getCoffee(): void { //eslint-disable-line class-methods-use-this
        console.log('\u2615 enjoy!');  //eslint-disable-line no-console
    }

    /**
     * Returns an object with the component default state
     *
     * @example
     * class Gallery extends Component {
     *  getInitialState() {
     *      return { currentImage: 0 };
     *  }
     * }
     *
     * const gallery = new Gallery().init();
     * //gallery.getState('currentImage') === 0
     */
    getInitialState(): stateType { //eslint-disable-line class-methods-use-this
        return {};
    }

    /**
     * Returns an object with the component default options
     *
     * @example
     * class Gallery extends Component {
     *  getDefaultOptions() {
     *      return { pagination: true };
     *  }
     * }
     *
     * const gallery = new Gallery().init();
     * //gallery.options.pagination === true
     */
    getDefaultOptions(): optionsType { //eslint-disable-line class-methods-use-this
        return {};
    }

    /**
     * Lifecycle hook called on instance creation
     */
    created(): void {} //eslint-disable-line class-methods-use-this

    /**
     * Lifecycle hook called when the instance got mount onto a DOM element
     */
    mounted(): void {} //eslint-disable-line class-methods-use-this

    /**
     * Lifecycle hook called before instance inizialization. At this stage component's state is empty
     */
    beforeInit(): void {} //eslint-disable-line class-methods-use-this

    /**
     * Lifecycle hook called after instance inizialization. State and event binding are already in place
     */
    afterInit(): void {} //eslint-disable-line class-methods-use-this

    /**
     * Lifecycle hook called just before closing child refs
     */
    beforeDestroy(): void {} //eslint-disable-line class-methods-use-this

    /**
     * Returns a state property
     *
     * @example
     * const instance = new Component('#app').init({ a: 1 });
     * // instancce.getState('a') === 1
     */
    getState(key: string): any {
        return this.state[key];
    }

    /**
     * Sets a state property. If the new value is different from the old one it emits a `change:<property>` event.
     * To prevent this behavior set the 3rd argument to `true`
     *
     * @example
     * instance.on('change:a', (next, prev) => console.log(next, prev));
     * instance.setState('a', 1); //emits 'change:a' -> logs undefined,1
     *
     * instance.setState('a', 1); //nothing happens
     * instance.setState('a', 2, true); //nothing happens, again...
     */
    setState(key: string, newValue: any, silent?: boolean = false) {
        const oldValue = this.getState(key);
        if (oldValue !== newValue) {
            this.state[key] = newValue;
            if (!silent) {
                this.emit('change:' + key, newValue, oldValue);
            }
        }
    }

    /**
     * Emits a `broadcast:<eventname>` event to every child element listed as a `$ref`
     *
     * @example
     * const child = new Component('#child');
     * child.on('broadcast:log', (str) => console.log(str));
     *
     * instance.setRef({ id: 'child', component: child });
     * instance.broadcast('log', 'test') // child component logs 'test'
     */
    broadcast(event: string, ...params?: Array<any>) {
        const { _$refsKeys, $refs } = this;

        for (let i = 0, l = _$refsKeys.length; i < l; i += 1) {
            const ref = _$refsKeys[i];
            $refs[ref].emit('broadcast:' + event, ...params);
        }
    }

    /**
     * Attaches a reference to a child component.
     * If a reference `id` is already attached, the previous one is destroyed and replaced with the new one
     *
     * @example
     * // as Constructor
     * instance.setRef({
     *  id: 'child',
     *  component: ChildComponent,
     *  el: '#child',
     *  options: { ... }
     * });
     *
     * // as instance
     * instance.setRef({
     *  id: 'child',
     *  component: new ChildComponent('#child', { ... }) // <-- don't call `init`
     * });
     */
    setRef(refCfg: refConstructorType | refInstanceType): Promise<Component> {

        let ref: Component;

        if (!isPlainObject(refCfg)) {
            throw new Error('Invalid reference configuration');
        }

        const { component } = refCfg;

        if (component instanceof Component) {
            ref = component;
        } else if (typeof component === 'function' && refCfg.el) {
            const { el, opts } = refCfg;
            ref = new component(el, opts); //eslint-disable-line new-cap
        } else {
            throw new Error('Invalid reference configuration');
        }

        const { id, props } = refCfg;

        if (!id) {
            throw new Error('Invalid reference id string');
        }

        const { $refs } = this;
        const prevRef = $refs[id];
        const inheritedState: stateType = {};
        $refs[id] = ref;

        if (props) {
            Object.keys(props).forEach((k) => {
                this.on(`change:${k}`, (v) => ref.setState(props[k], v));
                inheritedState[props[k]] = this.state[k];
            });
        }

        if (prevRef) {

            return prevRef.destroy().then(() => {
                const { $el } = this;
                if ($el.contains(prevRef.$el)) {
                    $el.replaceChild(ref.$el, prevRef.$el);
                } else {
                    $el.appendChild(ref.$el);
                }
                return ref.init(inheritedState);
            });
        }

        this._$refsKeys.push(id);

        return Promise.resolve(ref.init(inheritedState));
    }

    /**
     * Calls `.destroy()` on every child references and detaches them from the parent component.
     *
     * @private
     */
    closeRefs(): Promise<void> {
        const { $refs, _$refsKeys } = this;
        return Promise.all(_$refsKeys.map((ref: string): Promise<any> => {
            return $refs[ref].destroy();
        })).then((): void => {
            this.$refs = {};
            _$refsKeys.length = 0;
        }).catch((error: Error): void => {
            console.error('close refs', error);  //eslint-disable-line no-console
        });
    }

    /**
     * Detaches DOM events, instance's events and destroys all references as well
     */
    destroy(): Promise<void> {
        this.beforeDestroy();
        this.$ev.off();
        this.off();
        this.$el.removeAttribute(UID_DATA_ATTR);  //eslint-disable-line no-console


        return this.closeRefs().then((): void => {
            this._active = false;
        }).catch((error: Error): void => {
            console.error('destroy catch: ', error);  //eslint-disable-line no-console
        });
    }

}