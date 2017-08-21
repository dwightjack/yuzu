import expect from 'expect';
import tsumami from 'tsumami';

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
            const spy = expect.spyOn(console, 'log');
            const root = document.getElementById('app-fake-uid');
            const uid = root.getAttribute('data-yzid');
            inst.mount(root);
            inst.init();

            expect(spy).toHaveBeenCalled();
            const args = spy.calls[0].arguments;
            expect(args[0]).toContain(uid);
            expect(args[1]).toBe(inst.$el);
            console.log.restore();
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

        it('should pass selected state to child', (done) => {
            const component = new Child('.child');
            const spy = expect.spyOn(component, 'init').andCallThrough();
            const options = {
                props: { b: 'b' }
            };
            const expected = { b: 2 };

            inst.setRef({ id: 'child', component, options }).then(() => {
                expect(spy.calls[0].arguments[0]).toMatch(expected);
                done();
            }, done);




        });

    });

});