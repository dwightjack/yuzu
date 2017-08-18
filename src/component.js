// @flow
import dush from 'dush';
import type { dushInstance } from 'dush';
import { qs } from 'tsumami';
import { EventManager } from 'tsumami/lib/events';
import { nextUid, isElement, isPlainObject, assign } from './utils';

const defineProperty = Object.defineProperty;
const getOwnPropertyNames = Object.getOwnPropertyNames;
const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

const UID_DATA_ATTR = 'data-yzid';

export default class Component {

    el: Element;
    $el: Element;
    $els: {[element_id: string]: Element};
    $refs: {[ref_id: string]: Component};
    _$refsKeys: string[];
    options: optionsType;
    $ev: EventManager;
    state: stateType;
    ctx: Component;
    _uid: string;
    _active: boolean;

    on: dushInstance.on;
    off: dushInstance.off;
    once: dushInstance.once;
    emit: dushInstance.emit;
    use: dushInstance.use;
    _allEvents: dushInstance._allEvents;

    //adapted from https://github.com/jashkenas/backbone/blob/master/backbone.js#L2050
    static create(obj: { [string]: any}) {

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


        child.prototype = assign(Object.create(parent.prototype), props);
        child.prototype.constructor = child;

        child.__super__ = parent.prototype;

        return child;
    }

    constructor(el?: RootElement, options?: optionsType = {}) {

        assign(this, dush());

        this._active = false;

        //DOM references
        this.$els = {};

        //sub components references
        this.$refs = {};
        this._$refsKeys = [];

        this.options = assign(this.getDefaultOptions(), options);

        this.$ev = new EventManager();

        this.state = {};

        this.created();

        if (el) {
            this.mount(el);
        }
    }

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

        const { id = ref._iud, props } = refCfg;

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

    init(state?: stateType = {}): Component {

        const { $el } = this;

        //initialization placeholder
        let uid: ?string = $el.getAttribute(UID_DATA_ATTR);

        if (uid) {
            console.log(`Element ${uid} is already created`, $el); //eslint-disable-line no-console
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

        const initialState = assign(this.getInitialState(), state);
        Object.keys(initialState).forEach((key) => {
            this.setState(key, initialState[key]);
        });

        this._active = true;

        this.afterInit();

        return this;
    }

    broadcast(event: string, ...params?: Array<any>) {
        const { _$refsKeys, $refs } = this;

        for (let i = 0, l = _$refsKeys.length; i < l; i += 1) {
            const ref = _$refsKeys[i];
            $refs[ref].emit('broadcast:' + event, ...params);
        }
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

    getCoffee(): void { //eslint-disable-line class-methods-use-this
        console.log('\u2615 enjoy!');  //eslint-disable-line no-console
    }

    getInitialState(): stateType { //eslint-disable-line class-methods-use-this
        return {};
    }

    getDefaultOptions(): optionsType { //eslint-disable-line class-methods-use-this
        return {};
    }

    created(): void {} //eslint-disable-line class-methods-use-this

    mounted(): void {} //eslint-disable-line class-methods-use-this

    beforeInit(): void {} //eslint-disable-line class-methods-use-this

    afterInit(): void {} //eslint-disable-line class-methods-use-this

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

    destroy(): Promise<void> {
        this.emit('destroy');
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