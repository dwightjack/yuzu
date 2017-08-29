import expect from 'expect';
import dush from 'dush';
import tsumami from 'tsumami';
import { EventManager } from 'tsumami/lib/events';

import Component from '../src/component';
import { mount } from './utils';
import * as utils from '../src/utils';

// import {mount} from './utils';

describe('`Component`', () => {

    describe('static `.create`', () => {

        it('should return a Component constructor', () => {

            const MyComp = Component.create();
            const inst = new MyComp();
            expect(inst).toBeA(Component);

        });

        it('should set the a Component\'s `prototype.constructor` as the constructor', () => {
            const MyComp = Component.create();
            expect(MyComp.prototype.constructor).toBe(MyComp);
        });

        it('should set a `__super__` property pointing to the parent prototype', () => {
            const MyComp = Component.create();
            expect(MyComp.__super__).toBe(Component.prototype); //eslint-disable-line no-underscore-dangle
        });

        it('should call the parent constructor with passed-in arguments', () => {
            const spy = expect.createSpy();
            const MyComp = Component.create.call(spy);
            const inst = new MyComp('a'); //eslint-disable-line

            expect(spy).toHaveBeenCalledWith('a');
        });

        it('should call the parent constructor with the child context', () => {
            const spy = expect.createSpy();
            const MyComp = Component.create.call(spy);
            const inst = new MyComp('a'); //eslint-disable-line
            expect(spy.calls[0].context).toBeA(MyComp);
        });

        it('should allow to define a custom constructor function', () => {
            const spy = expect.createSpy();
            const MyComp = Component.create({
                constructor: spy
            });
            const inst = new MyComp('a'); //eslint-disable-line
            expect(spy).toHaveBeenCalledWith('a');
        });

        it('should copy static properties and methods', () => {
            const MyComp = Component.create();
            expect(MyComp.create).toBeA(Function);
            expect(MyComp.create).toBe(Component.create);
        });

        it('should copy even custom statics', () => {
            const MyComp = Component.create();

            MyComp.aProp = true;
            MyComp.aMethod = () => {};

            const ChildComp = MyComp.create();

            expect(ChildComp.aProp).toBe(MyComp.aProp);
            expect(ChildComp.aMethod).toBe(MyComp.aMethod);
        });

        it('should accept custom prototype methods', () => {

            const MyComp = Component.create({
                aMethod() { }
            });

            expect(MyComp.prototype.aMethod).toBeA(Function);

        });

    });

    describe('constructor', () => {

        let inst;

        beforeEach(() => {
            inst = new Component();
        });

        it('extends instance with dush methods', () => {
            const ev = dush();
            Object.keys(ev).forEach((k) => {
                expect(typeof inst[k]).toBe(typeof ev[k]);
            });

        });

        it('should set an `_active` property to `false`', () => {
            expect(inst._active).toBe(false);
        });

        it('should set an `$els` property to an empty object', () => {
            expect(inst.$els).toMatch({});
        });

        it('should set a `$refs` property to an empty object', () => {
            expect(inst.$refs).toMatch({});
        });

        it('should set a `_$refsKeys` property to an empty array', () => {
            expect(inst._$refsKeys).toBeA(Array);
            expect(inst._$refsKeys.length).toBe(0);
        });

        it('should expose an `options` object', () => {
            expect(inst.options).toMatch({});
        });

        it('should merge default and passed-in options', () => {

            const MyComp = Component.create({
                getDefaultOptions() {
                    return { a: 1, b: 0 };
                }
            });

            const i = new MyComp(null, { b: 2 });
            expect(i.options).toMatch({ a: 1, b: 2 });

        });

        it('should expose an instance of `tsumami/EventManager` under the `$ev` property', () => {
            expect(inst.$ev).toBeA(EventManager);
        });

        it('should expose an empty state object', () => {
            expect(inst.state).toMatch({});
        });

        it('should execute the created lifecycle hook', () => {
            const spy = expect.createSpy();
            const MyComp = Component.create({
                created: spy
            });
            new MyComp(); //eslint-disable-line
            expect(spy).toHaveBeenCalled();
        });

        it('should mount to a DOM node if provided', () => {
            const spy = expect.createSpy();
            const root = document.createElement('div');
            const MyComp = Component.create({
                mount: spy
            });
            new MyComp(root); //eslint-disable-line
            expect(spy).toHaveBeenCalled(root);
        });

        it('should NOT mount to a DOM node if root element is missing', () => {
            const spy = expect.createSpy();
            const MyComp = Component.create({
                mount: spy
            });
            new MyComp(); //eslint-disable-line
            expect(spy).toNotHaveBeenCalled();
        });


    });


    describe('`.mount()`', () => {

        let inst;
        let root;

        beforeEach(() => {
            expect.spyOn(window.console, 'warn');
            root = document.createElement('div');
            inst = new Component();
            mount('component.html');
        });

        afterEach(() => {
            window.console.warn.restore();
        });

        it('should check if component is already mounted', () => {
            expect(() => {
                inst.$el = root;
                inst.mount(root);
            }).toThrow(/mounted/);
        });

        it('should assign passed-in DOM element to both `el` and `$el` properties', () => {
            inst.mount(root);
            expect(inst.el).toBe(root);
            expect(inst.$el).toBe(root);
        });

        it('should accept a CSS selector string as mount target', () => {
            const selector = '#app';
            const spy = tsumami.qs.mock();
            inst.mount(selector);

            expect(spy).toHaveBeenCalledWith(selector);

            tsumami.qs.restore();
        });

        it('should call `mouted()` lifecycle method after mounting', () => {
            inst.mounted = expect.createSpy();
            inst.mount(root);
            expect(inst.mounted).toHaveBeenCalled();
        });

        it('should fail silently when passed-in argument does not resolve to a DOM element', () => {
            const spy = window.console.warn;
            expect(() => {
                inst.mount(null);
            }).toNotThrow();

            expect(spy).toHaveBeenCalled();
            expect(spy.calls[0].arguments[0]).toBeA('string');
            expect(spy.calls[0].arguments[1]).toBe(inst.$el);


        });

        it('should NOT call `mounted()` lifecycle when mount target is not a DOM element', () => {
            inst.mounted = expect.createSpy();
            inst.mount(null);
            expect(inst.mounted).toNotHaveBeenCalled();
        });

        it('should return the instance', () => {
            expect(inst.mount(root)).toBe(inst);
        });

        it('should return the instance when root element is invalid', () => {
            expect(inst.mount(null)).toBe(inst);
        });

    });


    describe('`init()`', () => {

        let inst;

        beforeEach(() => {
            inst = new Component();
            mount('component.html');
        });

        it('should check if component is mounted onto a DOM element', () => {
            inst.$el = null;
            expect(() => {
                inst.init();
            }).toThrow();
        });

        it('should check if a component has already been initialized on the DOM element', () => {
            const spy = expect.spyOn(console, 'warn');
            const root = document.getElementById('app-fake-uid');
            const uid = root.getAttribute('data-yzid');
            inst.mount(root);
            inst.init();

            expect(spy).toHaveBeenCalled();
            const args = spy.calls[0].arguments;
            expect(args[0]).toContain(uid);
            expect(args[1]).toBe(inst.$el);
            console.warn.restore(); //eslint-disable-line no-console
        });

        it('should set a unique `_uid` property', () => {
            inst.mount('#app').init();
            expect(inst._uid).toBeA('string');
        });

        it('should set `_uid` as `data-yzid` attribute on the root DOM element', () => {
            const root = document.getElementById('app');
            inst.mount(root).init();
            expect(root.getAttribute('data-yzid')).toBe(inst._uid);
        });

        it('should set a generated `id` DOM attribute onto the root element if not present', () => {
            const root = document.createElement('div');
            inst.mount(root).init();
            expect(root.id).toBe(`yuzu${inst._uid}`);
        });

        it('should keep the original id DOM attribute if already set', () => {
            const root = document.createElement('div');
            root.id = 'myId';
            inst.mount(root).init();
            expect(root.id).toBe('myId');
        });

        it('should call `.beforeInit()` lifecycle hook', () => {
            const spy = expect.spyOn(inst, 'beforeInit');
            inst.mount('#app').init();
            expect(spy).toHaveBeenCalled();
        });

        it('should NOT call `.beforeInit()` lifecycle hook if component id already initialized', () => {
            const spy = expect.spyOn(inst, 'beforeInit');
            inst.mount('#app-fake-uid').init();
            expect(spy).toNotHaveBeenCalled();
        });

        it('should call `beforeInit` lifecycle hook before state is initialized', () => {

            const state = { a: 0 };

            inst.afterInit = function afterInit() {
                expect(this.state).toMatch({});
            };

            inst.mount('#app').init(state);

        });

        it('should set state event bindings', () => {
            const noop = () => {};
            const fn = () => {};
            noop.bind = () => fn;
            inst.bindStateEvents = () => ({ fn: noop });

            const onSpy = expect.spyOn(inst, 'on');
            inst.mount('#app').init();
            expect(onSpy).toHaveBeenCalledWith('change:fn', fn);

        });

        it('should set state event bindings', () => {
            const noop = () => {};
            inst.bindStateEvents = () => ({ fn: noop });

            const onSpy = expect.spyOn(inst, 'on');
            inst.mount('#app').init();
            expect(onSpy).toHaveBeenCalled();

        });

        it('should attach state event to a change event', () => {
            const noop = () => {};
            inst.bindStateEvents = () => ({ fn: noop });

            const spy = expect.spyOn(inst, 'on');

            inst.mount('#app').init();
            expect(spy.calls[0].arguments[0]).toBe('change:fn');

        });

        it('should bind state event handlers to the instance', () => {
            const noop = () => {};
            const fn = () => {};
            noop.bind = expect.createSpy().andReturn(fn);
            inst.bindStateEvents = () => ({ fn: noop });

            inst.mount('#app').init();
            expect(noop.bind).toHaveBeenCalledWith(inst);

        });

        it('should resolve string values to instance methods', () => {
            inst.myMethod = () => {};
            const fn = () => {};
            inst.myMethod.bind = expect.createSpy().andReturn(fn);

            inst.bindStateEvents = () => ({ str: 'myMethod' });

            inst.mount('#app').init();
            expect(inst.myMethod.bind).toHaveBeenCalledWith(inst);

        });

        it('should call `getInitialState()`', () => {
            inst.getInitialState = expect.createSpy().andReturn({});

            inst.mount('#app').init();

            expect(inst.getInitialState).toHaveBeenCalled();
        });

        it('should call `setState` with computed initialstate from defaults and passed-in state', () => {
            const spy = expect.spyOn(inst, 'setState');

            const state = { a: 1, b: 2 };
            inst.getInitialState = () => ({ a: 0, c: 3 });

            const expected = utils.extend(inst.getInitialState(), state);

            inst.mount('#app').init(state);

            expect(spy.calls.length).toBe(Object.keys(expected).length);

            Object.keys(expected).forEach((k, i) => {
                expect(spy.calls[i].arguments).toEqual([k, expected[k]]);
            });

        });

        it('should set the `_active` flag to `true`', () => {
            inst.mount('#app').init();
            expect(inst._active).toBe(true);
        });

        it('should call `.afterInit()` lifecycle hook', () => {
            const spy = expect.spyOn(inst, 'afterInit');
            inst.mount('#app').init();
            expect(spy).toHaveBeenCalled();
        });

        it('should NOT call `.afterInit()` lifecycle hook if component id already initialized', () => {
            const spy = expect.spyOn(inst, 'afterInit');
            inst.mount('#app-fake-uid').init();
            expect(spy).toNotHaveBeenCalled();
        });

        it('should call `afterInit` lifecycle hook after state is initialized', () => {

            const state = { a: 0 };

            inst.afterInit = function afterInit() {
                expect(this.state).toMatch(state);
            };

            inst.mount('#app').init(state);

        });

        it('should call `afterInit` lifecycle hook after state event bindings have been set', () => {

            const state = { a: 0 };
            const spy = expect.createSpy();

            inst.bindStateEvents = () => ({ a: spy });

            inst.afterInit = function afterInit() {
                this.setState('a', 2);
            };

            inst.mount('#app').init(state);

            expect(spy).toHaveBeenCalled(0, 2);

        });

        it('should return the instance', () => {
            expect(inst.mount('#app').init()).toBe(inst);
        });

    });

    describe('`bindStateEvents()`', () => {

        it('should be a function', () => {
            const inst = new Component();
            expect(inst.bindStateEvents).toBeA(Function);
        });

        it('should return an emty object by default', () => {
            const inst = new Component();
            expect(inst.bindStateEvents()).toMatch({});
        });
    });

    describe('`getInitialState()`', () => {

        it('should be a function', () => {
            const inst = new Component();
            expect(inst.getInitialState).toBeA(Function);
        });

        it('should return an emty object by default', () => {
            const inst = new Component();
            expect(inst.getInitialState()).toMatch({});
        });
    });

    describe('`getDefaultOptions()`', () => {

        it('should be a function', () => {
            const inst = new Component();
            expect(inst.getDefaultOptions).toBeA(Function);
        });

        it('should return an emty object by default', () => {
            const inst = new Component();
            expect(inst.getDefaultOptions()).toMatch({});
        });
    });

    describe('lifecycle methods', () => {

        let inst;

        beforeEach(() => {
            inst = new Component();
            mount('component.html');
        });

        it('should have a `created` method', () => {
            expect(inst.created).toBeA(Function);
        });

        it('should have a `mounted` method', () => {
            expect(inst.mounted).toBeA(Function);
        });

        it('should have a `beforeInit` method', () => {
            expect(inst.beforeInit).toBeA(Function);
        });

        it('should have a `afterInit` method', () => {
            expect(inst.afterInit).toBeA(Function);
        });

        it('should have a `beforeDestroy` method', () => {
            expect(inst.beforeDestroy).toBeA(Function);
        });
    });

    describe('`getState()`', () => {

        let inst;

        beforeEach(() => {
            inst = new Component();
            mount('component.html');

            inst.mount('#app').init({ a: 1 });

        });

        it('should return a state property by key', () => {
            expect(inst.getState('a')).toBe(1);
        });

        it('should return `undefined` if key is not found', () => {
            expect(inst.getState('notFound')).toBe(undefined);
        });
    });

    describe('`setState()`', () => {

        let inst;

        beforeEach(() => {
            inst = new Component();
            mount('component.html');

            inst.mount('#app').init({ a: 1 });

        });

        it('should retrieve the old state', () => {
            const spy = expect.spyOn(inst, 'getState').andCallThrough();
            inst.setState('a', 2);

            expect(spy).toHaveBeenCalledWith('a');
        });

        it('should set the new passed-in state', () => {
            inst.setState('a', 2);
            expect(inst.state.a).toBe(2);
        });

        it('should accept `undefined` and `null`', () => {
            inst.setState('a', undefined);
            expect(inst.state.a).toBe(undefined);

            inst.setState('a', null);
            expect(inst.state.a).toBe(null);
        });

        it('should emit an change event when new value differs from old value', () => {
            const spy = expect.spyOn(inst, 'emit');
            const prev = inst.state.a;
            inst.setState('a', 2);
            expect(spy).toHaveBeenCalledWith('change:a', 2, prev);
        });

        it('should NOT emit events when old and new value are the same', () => {
            const spy = expect.spyOn(inst, 'emit');
            inst.setState('a', 1);
            expect(spy).toNotHaveBeenCalled();
        });

        it('should NOT emit events when the 3rd argument is true', () => {
            const spy = expect.spyOn(inst, 'emit');
            inst.setState('a', 2, true);
            expect(spy).toNotHaveBeenCalled();
        });

        it('should perform a strict equality check', () => {
            const spy = expect.spyOn(inst, 'emit');

            inst.state.nulled = null;
            inst.setState('nulled', undefined);
            expect(spy).toHaveBeenCalled();

            spy.reset();

            inst.state.obj = {};
            inst.setState('obj', {});



            //called because two objects are different
            expect(spy).toHaveBeenCalled();
        });

    });

    describe('`broadcast()`', () => {
        let inst;
        let root;
        let Child;

        beforeEach(() => {

            Child = Component.create();

            inst = new Component();
            mount('component.html');
            root = document.getElementById('ref');

            inst.mount(root).init({ a: 1, b: 2 });

            inst.$refs.child = new Child(document.createElement('div'));
            inst._$refsKeys.push('child');

        });

        it('should fire a `broadcast:*` event on every child', () => {
            const spy = expect.spyOn(inst.$refs.child, 'emit');

            inst.broadcast('test', 'string', 10);
            expect(spy.calls.length).toBe(inst._$refsKeys.length);

            spy.calls.forEach((c) => {
                expect(c.arguments).toMatch(['broadcast:test', 'string', 10]);
            });


        });

    });


    describe('`setRef()`', () => {

        let inst;
        let root;
        let Child;

        beforeEach(() => {

            Child = Component.create();

            inst = new Component();
            mount('component.html');
            root = document.getElementById('ref');

            inst.mount(root).init({ a: 1, b: 2 });

        });

        it('should throw id passed-in argument is not an object', () => {
            expect(() => {
                inst.setRef();
            }).toThrow();
        });

        it('should accept a component instance as child', () => {
            const childInst = new Child('.child');

            expect(() => {
                inst.setRef({ id: 'child', component: childInst });
            }).toNotThrow();
        });

        it('should accept a component constructor as child', () => {
            expect(() => {
                inst.setRef({ id: 'child', component: Child, el: '.child' });
            }).toNotThrow();
        });

        it('should throw when a child constructor does not have an el root element', () => {
            expect(() => {
                inst.setRef({ id: 'child', component: Child });
            }).toThrow();
        });

        it('should throw when an id is not set', () => {
            expect(() => {
                inst.setRef({ id: null, component: Child });
            }).toThrow();
        });

        it('should create a new instance from the passed-in component constructor', () => {
            const spy = expect.createSpy();
            const opts = { a: 1 };
            const MockChild = Component.create({
                constructor(...args) {
                    spy(...args);
                    return Component.apply(this, args);
                }
            });

            inst.setRef({
                id: 'child',
                component: MockChild,
                el: '.child',
                opts
            });
            expect(spy).toHaveBeenCalledWith('.child', opts);
        });

        it('should throw when the passed-in component is neither an instance nor a constructor with root element', () => {
            expect(() => {
                inst.setRef({ id: 'child', component: null });
            }).toThrow();
        });


        it('should create child/parent reference', () => {
            const childInst = new Child('.child');
            inst.setRef({ id: 'child', component: childInst });

            expect(inst.$refs.child).toBe(childInst);
        });

        it('should add an entry into the `_$refsKeys` array', () => {
            const childInst = new Child('.child');
            inst.setRef({ id: 'child', component: childInst });

            expect(inst._$refsKeys).toContain('child');
        });

        it('should pass selected state to child', () => {
            const component = new Child('.child');
            const spy = expect.spyOn(component, 'init').andCallThrough();
            const props = { b: 'b' };
            const expected = { b: 2 };

            inst.setRef({ id: 'child', component, props });
            expect(spy.calls[0].arguments[0]).toMatch(expected);

        });

        it('should return a promise', () => {
            const component = new Child('.child');

            const ret = inst.setRef({ id: 'child', component });

            expect(ret).toBeA(Promise);

        });

        it('should call previous reference\'s `destroy` method when a new reference is set', () => {

            const child = new Child('.child');
            const otherChild = new Child(document.createElement('p'));
            const spy = expect.spyOn(child, 'destroy').andCallThrough();

            inst.$refs.child = child;

            const ret = inst.setRef({ id: 'child', component: otherChild });
            expect(ret).toBeA(Promise);
            expect(spy).toHaveBeenCalled();
        });

        it('should replace previous reference\'s root element with the new reference `$el`', (done) => {

            const child = new Child('.child');
            const otherChild = new Child(document.createElement('p'));
            const spy = expect.spyOn(inst.$el, 'replaceChild').andCallThrough();

            expect.spyOn(inst.$el, 'contains').andReturn(true);

            inst.$refs.child = child;

            const ret = inst.setRef({ id: 'child', component: otherChild }).then(() => {
                expect(inst.$el.contains).toHaveBeenCalledWith(child.$el);
                expect(spy).toHaveBeenCalledWith(otherChild.$el, child.$el);
                done();
            });
            expect(ret).toBeA(Promise);
        });

        it('should append new reference `$el` when previuos `$el` is already detached', (done) => {

            const child = new Child('.child');
            const otherChild = new Child(document.createElement('p'));
            const spy = expect.spyOn(inst.$el, 'appendChild').andCallThrough();

            expect.spyOn(inst.$el, 'contains').andReturn(false);

            inst.$refs.child = child;

            inst.$el.removeChild(child.$el);

            const ret = inst.setRef({ id: 'child', component: otherChild }).then(() => {
                expect(inst.$el.contains).toHaveBeenCalledWith(child.$el);
                expect(spy).toHaveBeenCalledWith(otherChild.$el);
                done();
            });
            expect(ret).toBeA(Promise);
        });

    });

    describe('`setRef()`', () => {

        let inst;
        let root;
        let Child;

        beforeEach(() => {

            Child = Component.create();

            inst = new Component();
            mount('component.html');
            root = document.getElementById('ref');

            inst.mount(root).init({ a: 1, b: 2 });

        });

        it('should cycle every ref and call its `destroy method`', () => {

            const child = new Child(document.createElement('div'));
            const spy = expect.spyOn(child, 'destroy').andCallThrough();
            inst.$refs.child = child;
            inst._$refsKeys.push('child');

            inst.closeRefs();

            expect(spy).toHaveBeenCalled();

        });

        it('should return a Promise', () => {

            expect(inst.closeRefs()).toBeA(Promise);

        });

        it('should log any catched error to `console.error`', (done) => {

            const child = new Child(document.createElement('div'));
            const err = new Error('MOCK');
            expect.spyOn(child, 'destroy').andReturn(Promise.reject(err));

            const spy = expect.spyOn(console, 'error');

            inst.$refs.child = child;
            inst._$refsKeys.push('child');

            inst.closeRefs().then(() => {
                expect(spy).toHaveBeenCalledWith('close refs', err);
                spy.restore();
                done();
            });


        });

        it('should reset `$refs` and `_$refsKeys` properties', (done) => {

            const child = new Child(document.createElement('div'));
            inst.$refs.child = child;
            inst._$refsKeys.push('child');

            inst.closeRefs().then(() => {
                expect(inst.$refs).toMatch({});
                expect(inst._$refsKeys.length).toBe(0);
                done();
            });
        });

    });


    describe('`destroy()`', () => {

        let inst;
        let root;

        beforeEach(() => {

            inst = new Component();
            mount('component.html');
            root = document.getElementById('ref');

            inst.mount(root).init();

        });

        it('should call `beforeDestroy` lifecycle hook', () => {
            const spy = expect.spyOn(inst, 'beforeDestroy');

            inst.destroy();
            expect(spy).toHaveBeenCalled();
        });

        it('should detach any DOM event', () => {
            const spy = expect.spyOn(inst.$ev, 'off');

            inst.destroy();
            expect(spy).toHaveBeenCalled();
        });

        it('should detach any event handler', () => {
            const spy = expect.spyOn(inst, 'off');

            inst.destroy();
            expect(spy).toHaveBeenCalled();
        });

        it('should remove the `data-yzid` attribute from the element', () => {
            expect(inst.el.hasAttribute('data-yzid')).toBe(true);

            inst.destroy();
            expect(inst.el.hasAttribute('data-yzid')).toBe(false);
        });

        it('should call `closeRefs()` and deactivate the instance', (done) => {
            const spy = expect.spyOn(inst, 'closeRefs').andCallThrough();

            inst.destroy().then(() => {
                expect(inst._active).toBe(false);
                expect(spy).toHaveBeenCalled();
                done();
            });

        });

        it('should return a promise', () => {
            expect(inst.destroy()).toBeA(Promise);
        });

        it('should log any catched error to `console.error`', (done) => {

            const err = new Error('MOCK');
            expect.spyOn(inst, 'closeRefs').andReturn(Promise.reject(err));

            const spy = expect.spyOn(console, 'error');

            inst.destroy().then(() => {
                expect(spy).toHaveBeenCalledWith('destroy catch: ', err);
                spy.restore();
                done();
            });
        });

    });


});