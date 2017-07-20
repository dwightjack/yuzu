// @flow
import EventEmitter from 'events';
import { qs } from 'tsumami';
import { EventManager } from 'tsumami/lib/events';
import isElement from 'lodash.iselement';
import { nextUid } from './utils';



class Component extends EventEmitter {

    el: Element
    $el: Element
    $els: { [element_id: string]: Element }
    $refs: { [ref_id: string]: Component }
    options: {[string]: any}
    $ev: { [method_id: string]: Function }
    state: {[string]: any}
    _uid: string
    _active: boolean

    //adapted from https://github.com/jashkenas/backbone/blob/master/backbone.js#L2050
    static extend(props = {}) {
        const parent: Function = this;
        const child = props.constructor || function ChildConstructor(...args) {
            return parent.apply(this, args);
        };

        Object.assign(child, parent);

        child.prototype = Object.create(parent.prototype, props);
        child.prototype.constructor = child;

        child.__super__ = parent.prototype;

        return child;
    }

    constructor(el: Element, options?: {[string]: any} = { state: {} }) {
        super();
        this.setMaxListeners(0);

        this.el = this.$el = typeof el === 'string' ? qs(el) : el; //eslint-disable-line no-multi-assign

        if (!isElement(this.$el)) {
            //fail silently (kinda...);
            console.warn('Element is not a DOM element', this.$el); //eslint-disable-line no-console
            return this;
        }

        //DOM references
        this.$els = {};

        //sub components references
        this.$refs = {};

        this.options = Object.assign({}, this.getDefaultOptions(), options);

        const domEvents: EventManager = new EventManager();

        this.$ev = {};

        ['on', 'off', 'delegate', 'undelegate'].forEach((m) => {
            this.$ev[m] = domEvents.bind(domEvents, this.$el);
        });

        this.state = {};
    }

    setRef(id: string, ComponentClass: Component | Function, ...opts: [Element, {}]): Promise<Component> {
        const ref: Component = ComponentClass instanceof Component ? ComponentClass : new ComponentClass(...opts);
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

    init(state?: {[string]: any} = {}): Component {

        //initialization placeholder
        const uid: ?string = this.$el.getAttribute('data-ui-uid');

        if (uid) {
            console.log(`Element ${uid} is already created`, this.$el); //eslint-disable-line no-console
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
            this.on('change:' + key, stateEventsMap[key].bind(this));
        });

        const initialState = Object.assign({}, this.getInitialState(), state);
        Object.keys(initialState).forEach((key) => {
            this.setState(key, initialState[key]);
        });

        this._active = true;

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

    bindStateEvents(): { [event_id: string]: Function } { //eslint-disable-line class-methods-use-this
        return {};
    }

    getCoffee() { //eslint-disable-line class-methods-use-this
        console.log('\u2615 enjoy!');  //eslint-disable-line no-console
    }

    getInitialState(): { [string]: any } { //eslint-disable-line class-methods-use-this
        return {};
    }

    getDefaultOptions(): { [string]: any } { //eslint-disable-line class-methods-use-this
        return {};
    }

    beforeInit() { //eslint-disable-line class-methods-use-this
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

    destroy() {
        this.emit('destroy');
        this.$ev.off();
        this.removeAllListeners();
        this.$el.removeAttribute('data-ui-uid');  //eslint-disable-line no-console


        return this.closeRefs().then((): void => {
            this._active = false;
        }).catch((error: Error): void => {
            console.error('destroy catch: ', error);  //eslint-disable-line no-console
        });
    }

}

export default Component;