// @flow
import EventEmitter from 'events';
import { qs } from 'tsumami';
import { EventManager } from 'tsumami/lib/events';
import { nextUid, isElement, isPlainObject } from './utils';

const getOwnPropertyNames = Object.getOwnPropertyNames;
const propIsEnumerable = Object.prototype.propertyIsEnumerable;

const UID_DATA_ATTR = 'data-yzid';

export default class Component extends EventEmitter {

    el: Element
    $el: Element
    $els: {[element_id: string]: Element}
    $refs: {[ref_id: string]: Component}
    options: optionsType
    $ev: EventManager
    state: stateType
    _uid: string
    _active: boolean
    ctx: Component

    //adapted from https://github.com/jashkenas/backbone/blob/master/backbone.js#L2050
    static create(props: { [string]: any} = {}) {
        const parent: Function = this;
        const child = props.hasOwnProperty('constructor') ? props.constructor : function ChildConstructor(...args) { //eslint-disable-line no-prototype-builtins
            return parent.apply(this, args);
        };

        //https://github.com/mridgway/hoist-non-react-statics/blob/master/index.js#L51
        const keys = getOwnPropertyNames(parent);
        for (let i = 0; i < keys.length; ++i) { //eslint-disable-line no-plusplus
            const key = keys[i];
            if (propIsEnumerable.call(parent, key) || typeof parent[key] === 'function') {
                try { // Avoid failures from read-only properties
                    child[key] = parent[key];
                } catch (e) {} //eslint-disable-line no-empty
            }
        }

        child.prototype = Object.assign(Object.create(parent.prototype), props);
        child.prototype.constructor = child;

        child.__super__ = parent.prototype;

        return child;
    }

    constructor(el?: Element | string, options?: optionsType = {}) {
        super();
        this.setMaxListeners(0);

        this._active = false;

        //DOM references
        this.$els = {};

        //sub components references
        this.$refs = {};

        this.options = Object.assign({}, this.getDefaultOptions(), options);

        this.$ev = new EventManager();

        this.state = {};

        if (el) {
            this.mount(el);
        }
    }

    mount(el: Element | string) {

        if (this.$el) {
            throw new Error('Component is already mounted');
        }

        this.el = this.$el = typeof el === 'string' ? qs(el) : el; //eslint-disable-line no-multi-assign

        if (!isElement(this.$el)) {
            //fail silently (kinda...);
            console.warn('Element is not a DOM element', this.$el); //eslint-disable-line no-console
        }

        return this;
    }

    setRef(refCfg: refConstructorType | refInstanceType): Promise<Component> {

        let ref: Component;

        if (!isPlainObject(refCfg)) {
            throw new Error('Invalid reference configuration');
        }

        if (refCfg.component instanceof Component) {
            ref = refCfg.component;
        } else if (typeof refCfg.component === 'function' && refCfg.el) {
            const { el, opts, component } = refCfg;
            ref = new component(el, opts); //eslint-disable-line new-cap
        } else {
            throw new Error('Invalid reference configuration');
        }

        const { id = ref._iud, props } = refCfg;

        if (!id) {
            throw new Error('Invalid reference id string');
        }

        const prevRef = this.$refs[id];
        const inheritedState: stateType = {};
        this.$refs[id] = ref;

        if (props) {
            Object.keys(props).forEach((k) => {
                this.on(`change:${k}`, (v) => ref.setState(props[k], v));
                inheritedState[props[k]] = this.state[k];
            });
        }

        if (prevRef) {
            return prevRef.destroy().then(() => {
                if (this.$el.contains(prevRef.$el)) {
                    this.$el.replaceChild(ref.$el, prevRef.$el);
                } else {
                    this.$el.appendChild(ref.$el);
                }
                return ref.init(inheritedState);
            });
        }

        // if (!this.$el.contains(ref.$el)) {
        //     this.$el.appendChild(ref.$el);
        // }

        return Promise.resolve(ref.init(inheritedState));
    }

    init(state?: stateType): Component {

        //initialization placeholder
        const uid: ?string = this.$el.getAttribute(UID_DATA_ATTR);

        if (uid) {
            console.log(`Element ${uid} is already created`, this.$el); //eslint-disable-line no-console
            return this;
        }

        this._uid = nextUid();

        this.$el.setAttribute(UID_DATA_ATTR, this._uid);

        if (!this.$el.id) {
            this.$el.id = 'yuzu' + this._uid;
        }

        this.beforeInit();

        const stateEventsMap = this.bindStateEvents();
        Object.keys(stateEventsMap).forEach((key) => {
            // $FlowFixMe
            const method: Function = typeof stateEventsMap[key] === 'string' && typeof this[stateEventsMap[key]] === 'function' ? this[stateEventsMap[key]] : stateEventsMap[key];
            this.on('change:' + key, method.bind(this));
        });

        const initialState = Object.assign({}, this.getInitialState(), state);
        Object.keys(initialState).forEach((key) => {
            this.setState(key, initialState[key]);
        });

        this._active = true;

        this.afterInit();

        return this;
    }

    broadcast(event: string, ...params?: Array<any>) {
        Object.keys(this.$refs).forEach((ref) => this.$refs[ref].emit('broadcast:' + event, ...params));
    }

    getState(key: string): any {
        return this.state[key];
    }

    setState(key: string, newValue: any, silent?: boolean = false) {
        const oldValue = this.getState(key);
        if (oldValue !== newValue) {
            this.state[key] = newValue;
            if (!silent) {
                this.emit('change:' + key, newValue, oldValue);
            }
        }
    }

    bindStateEvents(): { [event_id: string]: Function | string } { //eslint-disable-line class-methods-use-this
        return {};
    }

    getCoffee() { //eslint-disable-line class-methods-use-this
        console.log('\u2615 enjoy!');  //eslint-disable-line no-console
    }

    getInitialState(): stateType { //eslint-disable-line class-methods-use-this
        return {};
    }

    getDefaultOptions(): optionsType { //eslint-disable-line class-methods-use-this
        return {};
    }

    beforeInit() { //eslint-disable-line class-methods-use-this
    }

    afterInit() { //eslint-disable-line class-methods-use-this
    }

    closeRefs(): Promise<void> {
        return Promise.all(Object.keys(this.$refs).map((ref: string): Promise<any> => {
            return this.$refs[ref].destroy();
        })).then((): void => {
            this.$refs = {};
        }).catch((error: Error): void => {
            console.error('close refs', error);  //eslint-disable-line no-console
        });
    }

    destroy(): Promise<void> {
        this.emit('destroy');
        this.$ev.off();
        this.removeAllListeners();
        this.$el.removeAttribute(UID_DATA_ATTR);  //eslint-disable-line no-console


        return this.closeRefs().then((): void => {
            this._active = false;
        }).catch((error: Error): void => {
            console.error('destroy catch: ', error);  //eslint-disable-line no-console
        });
    }

}