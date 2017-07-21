
import EventEmitter from 'events';
import { qs } from 'tsumami';
import { EventManager } from 'tsumami/lib/events';
import isElement from 'lodash.iselement';
import { nextUid } from './utils';



class Component extends EventEmitter {

    //adapted from https://github.com/jashkenas/backbone/blob/master/backbone.js#L2050
    static extend(props = {}) {
        const parent = this;
        const child = props.constructor || function ChildConstructor(...args) {
            return parent.apply(this, args);
        };

        Object.assign(child, parent);

        child.prototype = Object.create(parent.prototype, props);
        child.prototype.constructor = child;

        child.__super__ = parent.prototype;

        return child;
    }

    constructor(el, options = { state: {} }) {
        super();
        this.setMaxListeners(0);

        this.el = this.$el = typeof el === 'string' ? qs(el) : el; //eslint-disable-line no-multi-assign

        if (!isElement(this.$el)) {
            //fail silently (kinda...);
            console.warn(`Element ${this.$el} is not a DOM element`); //eslint-disable-line no-console
            return this;
        }

        //DOM references
        this.$els = {};

        //sub components references
        this.$refs = {};

        this.options = Object.assign({}, this.getDefaultOptions(), options);

        const domEvents = new EventManager();

        this.$ev = {};

        ['on', 'off', 'delegate', 'undelegate'].forEach((m) => {
            this.$ev[m] = domEvents.bind(domEvents, this.$el);
        });

        this.state = {};
    }

    setRef(id, ComponentClass, ...opts) {
        const ref = ComponentClass instanceof Component ? ComponentClass : new ComponentClass(...opts);
        const prevRef = this.$refs[id];
        this.$refs[id] = ref;

        if (prevRef) {
            return prevRef.destroy().then(() => {
                if (this.$el.contains(prevRef.$el)) {
                    this.$el.replaceChild(ref.$el, prevRef.$el);
                } else {
                    this.$el.appendChild(ref.$el);
                }
                return ref.init();
            });
        }

        // if (!this.$el.contains(ref.$el)) {
        //     this.$el.appendChild(ref.$el);
        // }

        return Promise.resolve(ref.init());
    }

    init(state = {}) {

        //initialization placeholder
        if (this.$el.getAttribute('data-ui-uid')) {
            console.log(`Element ${this.$el.getAttribute('data-ui-uid')} is already created`, this.$el); //eslint-disable-line no-console
            return this;
        }

        this._uid = nextUid();
        this.$el.setAttribute('data-ui-uid', this._uid);

        if (!this.$el.id) {
            this.$el.id = 'component' + this._uid;
        }

        this.beforeInit();

        const stateEventsMap = this.bindStateEvents();
        Object.keys(stateEventsMap).forEach((key) => {
            const method = typeof stateEventsMap[key] === 'string' ? this[stateEventsMap[key]] : stateEventsMap[key];
            this.on('change:' + key, method.bind(this));
        });

        const initialState = Object.assign({}, this.getInitialState(), state);
        Object.keys(initialState).forEach((key) => {
            this.setState(key, initialState[key]);
        });

        this._active = true;

        return this;
    }

    broadcast(event, ...params) {
        Object.keys(this.$refs).forEach((ref) => this.$refs[ref].emit('broadcast:' + event, ...params));
    }

    getState(key) {
        return this.state[key];
    }

    setState(key, newValue, silent = false) {
        const oldValue = this.getState(key);
        if (oldValue !== newValue) {
            this.state[key] = newValue;
            if (!silent) {
                this.emit('change:' + key, newValue, oldValue);
            }
        }
    }

    bindStateEvents() { //eslint-disable-line class-methods-use-this
        return {};
    }

    getCoffee() { //eslint-disable-line class-methods-use-this
        console.log('\u2615 enjoy!');  //eslint-disable-line no-console
    }

    getInitialState() { //eslint-disable-line class-methods-use-this
        return {};
    }

    getDefaultOptions() { //eslint-disable-line class-methods-use-this
        return {};
    }

    beforeInit() { //eslint-disable-line class-methods-use-this
    }

    closeRefs() {
        return Promise.all(Object.keys(this.$refs).map((ref) => {
            return this.$refs[ref].destroy();
        })).then(() => {
            this.$refs = {};
        }).catch((error) => {
            console.error('close refs', error);  //eslint-disable-line no-console
        });
    }

    destroy() {
        this.emit('destroy');
        this.$ev.off();
        this.removeAllListeners();
        this.$el.removeAttribute('data-ui-uid');  //eslint-disable-line no-console


        return this.closeRefs().then(() => {
            this._active = false;
        }).catch((error) => {
            console.error('destroy catch: ', error);  //eslint-disable-line no-console
        });
    }

}

export default Component;


/**
 *
 * #### Example
 *
 * ```
 *
 * ```
 *
 * @param {Component} parentInstance
 * @param {object} binds
 */

export const connect = (
    parentInstance,
    binds = {}
) => (componentClass) => {

    class WrappedComponent extends componentClass {

        init(state) {
            const keys = Object.keys(binds);
            const parentState = keys.reduce((o, k) => (
                Object.assign(o, { [binds[k]]: parentInstance.getState(k) })
            ), {});

            keys.forEach((k) => {
                parentInstance.on('change:' + k, (newValue) => {
                    this.setState(binds[k], newValue);
                });
            });

            super.init(Object.assign(parentState, state));
        }

    }

    WrappedComponent.name = `connected(${componentClass.name || 'Component'})`;

    return WrappedComponent;
};