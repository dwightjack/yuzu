import dush from 'dush';

import { Component } from '../src/component';
import { mount } from '../../../shared/utils';
import * as utils from '@yuzu/utils';

describe('`Component`', () => {
  describe('defaultOptions', () => {
    it('should have a static "defaultOptions" method', () => {
      expect(Component.defaultOptions).toEqual(jasmine.any(Function));
    });
    it('should return an object', () => {
      expect(Component.defaultOptions()).toEqual({});
    });
  });

  describe('isComponent', () => {
    it('should return false if argument in falsy', () => {
      expect(Component.isComponent(null)).toBe(false);
    });
    it('should return false if argument has a non-function "defaultOptions" property ', () => {
      const value = {
        defaultOptions: {},
      };
      expect(Component.isComponent(value)).toBe(false);
    });
    it('should return true if argument has a "defaultOptions" property  and it is a function', () => {
      const value = {
        defaultOptions: () => ({}),
      };
      expect(Component.isComponent(value)).toBe(true);
    });
  });

  describe('constructor', () => {
    let inst: Component;

    beforeEach(() => {
      inst = new Component();
    });

    it('extends instance with dush methods', () => {
      const ev: any = dush();
      Object.keys(ev).forEach((k) => {
        const m = (inst as any)[k];
        expect(typeof m).toBe(typeof ev[k]);
      });
    });
    it('should set an `$active` property to `false`', () => {
      expect(inst.$active).toBe(false);
    });
    it('should set a `state` property to an empty object', () => {
      expect(inst.state).toEqual({});
    });
    it('should set an `$els` property to an empty object', () => {
      expect(inst.$els).toEqual({});
    });
    it('should set a `$refs` property to an empty object', () => {
      expect(inst.$refs).toEqual({});
    });
    it('should set a `$refsStore` map', () => {
      expect(inst.$refsStore).toEqual(jasmine.any(Map));
      expect(inst.$refsStore.size).toBe(0);
    });
    it('should set a `$listeners` map', () => {
      expect(inst.$listeners).toEqual(jasmine.any(Map));
      expect(inst.$listeners.size).toBe(0);
    });
    it('should set an `option` object', () => {
      expect(inst.options).toEqual({});
    });

    it('should set default options from static `defaultOptions` method', () => {
      const options = { demo: true };
      class Child extends Component {
        public static defaultOptions = () => options;
      }
      const child = new Child();
      expect(child.options).toEqual(options);
    });

    it('should merge default options with instance options', () => {
      const options = { demo: true };
      class Child extends Component {
        // tslint:disable-line max-classes-per-file
        public static defaultOptions = () => options;
      }
      const child = new Child({ demo: false });
      expect(child.options).toEqual({ demo: false });
    });

    it('should exclude passed-in options not defined in the defaults', () => {
      const options = { demo: true };
      class Child extends Component {
        // tslint:disable-line max-classes-per-file
        public static defaultOptions = () => options;
      }
      const child = new Child({ other: 'yes' });
      expect(child.options).not.toEqual(
        jasmine.objectContaining({ other: 'yes' }),
      );
    });

    it('should bind functions to the instance', () => {
      const spy = jasmine.createSpy();
      const options = { demo: spy };
      class Child extends Component {
        // tslint:disable-line max-classes-per-file
        public static defaultOptions = () => options;
      }
      const child = new Child();
      child.options.demo();
      expect(spy.calls.mostRecent().object).toBe(child);
    });

    it('should execute the created lifecycle hook', () => {
      const spy = jasmine.createSpy();
      class Child extends Component {
        // tslint:disable-line max-classes-per-file
        public created() {
          spy();
        }
      }
      const i = new Child();
      expect(spy).toHaveBeenCalled();
    });
  });
  describe('`.mount()`', () => {
    let inst: Component;
    let root: HTMLElement;
    beforeEach(() => {
      root = document.createElement('div');
      inst = new Component();
      mount('component.html');
    });
    it('should check if component is already mounted', () => {
      expect(() => {
        inst.$el = root;
        inst.mount(root);
      }).toThrow();
    });
    it('should emit a warning if passed-in root is not an element', () => {
      const spy = spyOn(console, 'warn');
      const spyHook = spyOn(inst, 'beforeMount');
      spyOn(utils, 'isElement').and.returnValue(false);
      expect(() => {
        inst.mount(root);
      }).not.toThrow();
      expect(spy).toHaveBeenCalled();
      expect(spyHook).not.toHaveBeenCalled();
    });

    it('should return the instance when root element is invalid', () => {
      spyOn(utils, 'isElement').and.returnValue(false);
      expect(inst.mount(root)).toBe(inst);
    });
    it('should assign passed-in DOM element to `$el` properties', () => {
      inst.mount(root);
      expect(inst.$el).toBe(root);
    });
    it('should accept a CSS selector string as mount target', () => {
      const selector = '#app';
      const spy = spyOn(utils, 'qs');
      inst.mount(selector);
      expect(spy).toHaveBeenCalledWith(selector);
    });
    it('should call `beforeMount()` lifecycle method', () => {
      const spy = spyOn(inst, 'beforeMount');
      inst.mount(root);
      expect(spy).toHaveBeenCalled();
    });
    it('should call `mounted()` lifecycle method after mounting', () => {
      const spy = spyOn(inst, 'mounted');
      inst.mount(root);
      expect(spy).toHaveBeenCalled();
    });
    it('should resolve child elements selectors', () => {
      const child = document.createElement('div');
      const spy = spyOn(utils, 'qs').and.returnValue(child);
      inst.selectors = {
        child: '.child-demo',
      };
      inst.mount(root);
      expect(spy).toHaveBeenCalledWith('.child-demo', root);
      expect(inst.$els.child).toBe(child);
    });
    it('should attach event listeners. handlers are binded to the instance', () => {
      const fn = () => undefined;
      const handler = fn;
      const def = 'click @def';
      const spy = spyOn(utils, 'bindMethod').and.returnValue(fn);
      const spy2 = spyOn(inst, 'setListener').and.returnValue(fn);
      inst.listeners = {
        [def]: handler,
      };
      inst.mount(root);
      expect(spy).toHaveBeenCalledWith(inst, handler);
      expect(spy2).toHaveBeenCalledWith(def, fn);
    });
    it('should call init method by default', () => {
      const spy = spyOn(inst, 'init');
      inst.mount(root);
      expect(spy).toHaveBeenCalled();
    });
    it('should call init method with passed-in state', () => {
      const state = {};
      const spy = spyOn(inst, 'init');
      inst.mount(root, state);
      expect(spy).toHaveBeenCalledWith(state);
    });
    it('should NOT call init method when passed-in state is falsy', () => {
      const spy = spyOn(inst, 'init');
      inst.mount(root, null);
      expect(spy).not.toHaveBeenCalled();
    });
    it('should return the instance', () => {
      expect(inst.mount(root)).toBe(inst);
    });
  });
  describe('`init()`', () => {
    let inst: Component;
    let root: HTMLElement;
    beforeEach(() => {
      root = document.createElement('div');
      inst = new Component();
      inst.$el = root;
      mount('component.html');
    });
    it('should check if component is mounted onto a DOM element', () => {
      spyOn(utils, 'isElement').and.returnValue(false);
      expect(() => {
        inst.init();
      }).toThrow();
    });
    it('should check if a component has already been initialized on the DOM element', () => {
      const spy = spyOn(console, 'warn');
      const uid = 'fake-uid';
      root.setAttribute('data-cid', uid);
      inst.init();
      expect(spy).toHaveBeenCalled();
      const [msg, ref] = spy.calls.mostRecent().args;
      expect(msg).toContain(uid);
      expect(ref).toBe(inst.$el);
    });
    it('should set a unique `_uid` property', () => {
      inst.init();
      expect(inst.$uid).toEqual(jasmine.any(String));
    });
    it('should set `$uid` as `data-cid ` attribute on the root DOM element', () => {
      inst.init();
      expect(root.getAttribute('data-cid')).toBe(inst.$uid);
    });
    it('should set a generated `id` DOM attribute onto the root element if not present', () => {
      inst.init();
      expect(root.id).toBe(`c_${inst.$uid}`);
    });
    it('should keep the original id DOM attribute if already set', () => {
      root.id = 'myId';
      inst.init();
      expect(root.id).toBe('myId');
    });
    it('should call `.initialize()` lifecycle hook', () => {
      const spy = spyOn(inst, 'initialize');
      inst.init();
      expect(spy).toHaveBeenCalled();
    });
    it('should NOT call `.initialize()` lifecycle hook if component is already initialized', () => {
      const spy = spyOn(inst, 'initialize');
      root.setAttribute('data-cid', 'fake-id');
      inst.init();
      expect(spy).not.toHaveBeenCalled();
    });
    it('should call `initialize` lifecycle hook before passed-in state gets applied', () => {
      const state = { a: 0 };
      inst.initialize = () => {
        expect(inst.state).toEqual({});
      };
      inst.init(state);
    });
    it('should bind configured actions', () => {
      const handler = () => undefined;
      const spyBind = spyOn(utils, 'bindMethod').and.returnValue(handler);
      const spy = spyOn(inst, 'on');
      inst.actions = {
        count: 'increment',
      };

      inst.init();
      expect(spy).toHaveBeenCalledWith('change:count', handler);
      expect(spyBind).toHaveBeenCalledWith(inst, 'increment');
      expect(spy.calls.count()).toBe(1);
    });
    it('should call replace state with initial and passed-in state', () => {
      const inState = { surname: 'Doe' };
      inst.state = { name: 'John' };
      const expected = { ...inst.state, ...inState };
      const spy = spyOn(inst, 'replaceState');
      inst.init(inState);
    });
    it('should set the `$active` flag to `true`', () => {
      inst.init();
      expect(inst.$active).toBe(true);
    });
    it('should call `.ready()` lifecycle hook', () => {
      const spy = spyOn(inst, 'ready');
      inst.init();
      expect(spy).toHaveBeenCalled();
    });

    it('should call `ready` lifecycle hook after state is initialized', () => {
      const spy = spyOn(inst, 'replaceState').and.callThrough();

      inst.ready = () => {
        expect(spy).toHaveBeenCalled();
      };
      inst.init();
    });
    it('should call `ready` lifecycle hook after state event bindings have been set', () => {
      const state = { a: 0 };
      const fn = () => undefined;
      const spy = spyOn(inst, 'on');
      spyOn(utils, 'bindMethod').and.returnValue(fn);
      inst.actions = {
        a: fn,
      };
      inst.ready = function ready() {
        expect(spy).toHaveBeenCalledWith('change:a', fn);
      };
      inst.init(state);
    });
    it('will not call "ready" if a readyState method is set', () => {
      const spy = spyOn(inst, 'ready');
      inst.readyState = () => false;
      inst.init();
      expect(spy).not.toHaveBeenCalled();
    });
    it('will call "readyState" on state change', () => {
      inst.readyState = jasmine.createSpy().and.returnValue(false);
      inst.state = { a: 0 };
      inst.init();
      expect(inst.readyState).not.toHaveBeenCalled();

      inst.setState({ a: 1 });
      expect(inst.readyState).toHaveBeenCalledWith({ a: 1 }, { a: 0 });
    });

    it('will NOT execute "ready" if "readyState" returns false', () => {
      inst.readyState = () => false;
      inst.ready = jasmine.createSpy();
      inst.init({ a: 0 });
      inst.setState({ a: 1 });
      expect(inst.ready).not.toHaveBeenCalled();
    });

    it('will execute "ready" if "readyState" returns true', () => {
      inst.readyState = () => true;
      inst.ready = jasmine.createSpy();
      inst.init({ a: 0 });
      inst.setState({ a: 1 });
      expect(inst.ready).toHaveBeenCalled();
    });

    it('will unbind "readyState" checks after ready is executed', () => {
      inst.readyState = () => true;
      const spy = spyOn(inst, 'ready');
      inst.init({ a: 0 });
      inst.setState({ a: 1 });
      inst.setState({ a: 2 });
      expect(spy.calls.count()).toBe(1);
    });

    it('should return the instance', () => {
      expect(inst.init()).toBe(inst);
    });
  });

  describe('lifecycle methods', () => {
    let inst: Component;
    beforeEach(() => {
      inst = new Component();
      mount('component.html');
    });
    it('should have a `created` method', () => {
      expect(inst.created).toEqual(jasmine.any(Function));
    });
    it('should have a `beforeMount` method', () => {
      expect(inst.beforeMount).toEqual(jasmine.any(Function));
    });
    it('should have a `mounted` method', () => {
      expect(inst.mounted).toEqual(jasmine.any(Function));
    });
    it('should have a `initialize` method', () => {
      expect(inst.initialize).toEqual(jasmine.any(Function));
    });
    it('should have a `ready` method', () => {
      expect(inst.ready).toEqual(jasmine.any(Function));
    });
    it('should have a `beforeDestroy` method', () => {
      expect(inst.beforeDestroy).toEqual(jasmine.any(Function));
    });
  });
  describe('`getState()`', () => {
    let inst: Component;
    beforeEach(() => {
      inst = new Component();
      inst.state = {
        a: 1,
      };
    });
    it('should return a state property by key', () => {
      expect(inst.getState('a')).toBe(1);
    });
    it('should return `undefined` if key is not found', () => {
      expect(inst.getState('notFound')).toBe(undefined);
    });
  });
  describe('`shouldUpdateState()`', () => {
    let inst: Component;
    beforeEach(() => {
      inst = new Component();
    });
    it('should strictly compare 2 values and return true if they are different', () => {
      expect(inst.shouldUpdateState('', 1, 1)).toBe(false);
      expect(inst.shouldUpdateState('', '1', 1)).toBe(true);
      expect(inst.shouldUpdateState('', {}, {})).toBe(true);
    });
  });
  describe('`setState()`', () => {
    let inst: Component;
    beforeEach(() => {
      inst = new Component();
      inst.state = {
        a: 1,
        b: 2,
      };
    });
    it('should evaluate the passed-in argument', () => {
      const spy = spyOn(utils, 'evaluate').and.callThrough();
      const updater = () => ({});
      inst.setState(updater);
      expect(spy).toHaveBeenCalledWith(updater, inst.state);
    });

    it('should cycle the current state and call shouldUpdateState on changed keys', () => {
      const spy = spyOn(inst, 'shouldUpdateState').and.callThrough();
      const updater = () => ({});
      inst.setState({ a: 2 });
      expect(spy).toHaveBeenCalledWith('a', 1, 2);
      expect(spy.calls.count()).toBe(1);
    });

    it('if shouldUpdateState returns true the key is updated', () => {
      const spy = spyOn(inst, 'shouldUpdateState').and.returnValue(true);
      const updater = () => ({});
      inst.setState({ a: 2 });
      expect(inst.state.a).toBe(2);
    });

    it('if shouldUpdateState returns false the key is NOT updated', () => {
      const spy = spyOn(inst, 'shouldUpdateState').and.returnValue(false);
      const updater = () => ({});
      inst.setState({ a: 2 });
      expect(inst.state.a).not.toBe(2);
    });

    it('does NOT account for keys not already set on the state', () => {
      inst.setState({ c: 1 });
      expect(inst.state.c).toBeUndefined();
    });

    it('emits a `change:` event for every changed key', () => {
      const spy = spyOn(inst, 'emit');
      inst.setState({ a: 2, b: 2 });
      expect(spy).toHaveBeenCalledWith('change:a', 2, 1);
      expect(spy).not.toHaveBeenCalledWith('change:b', 2, 2);
    });

    it('emits a `change:*` with full state (prev and current)', () => {
      const spy = spyOn(inst, 'emit');
      const prev = { ...inst.state };
      inst.setState({ a: 2, b: 2 });
      expect(spy).toHaveBeenCalledWith('change:*', inst.state, prev);
    });

    it('does NOT emit when "silent" is true', () => {
      const spy = spyOn(inst, 'emit');
      inst.setState({ a: 2, b: 3 }, true);
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('`replaceState()`', () => {
    let inst: Component;
    beforeEach(() => {
      inst = new Component();
      inst.state = {
        a: 1,
      };
    });
    it('replaces current state', () => {
      inst.replaceState({ b: 2 });
      expect(inst.state).toEqual({ b: 2 });
    });
    it('clones the passed-in object', () => {
      const state = { b: 2 };
      inst.replaceState(state);
      expect(inst.state).not.toBe(state);
    });
    it('emits a change event for each new key', () => {
      const spy = spyOn(inst, 'emit');
      inst.replaceState({ b: 2, c: 3 });
      const [bCalls, cCalls] = spy.calls.allArgs();
      expect(bCalls).toEqual(['change:b', 2, undefined]);
      expect(cCalls).toEqual(['change:c', 3, undefined]);
    });

    it('emits a change:* event', () => {
      const spy = spyOn(inst, 'emit');
      const oldState = { ...inst.state };
      inst.replaceState({ b: 2, c: 3 });
      expect(spy.calls.mostRecent().args).toEqual([
        'change:*',
        { b: 2, c: 3 },
        oldState,
      ]);
    });

    it('does NOT emit events if silent is true', () => {
      const spy = spyOn(inst, 'emit');
      inst.replaceState({ b: 2, c: 3 }, true);
      expect(spy).not.toHaveBeenCalled();
    });
  });
  describe('`broadcast()`', () => {
    let inst: Component;
    beforeEach(() => {
      inst = new Component();
      inst.mount(document.createElement('div'));
      inst.setRef({
        id: 'child',
        component: Component,
        el: document.createElement('div'),
      });
    });
    it('should fire a `broadcast:*` event on every child', () => {
      const spy = spyOn(inst.$refs.child, 'emit');
      inst.broadcast('test', 'string', 10);
      expect(spy.calls.count()).toBe(1);
      spy.calls.allArgs().forEach((args) => {
        expect(args).toEqual(['broadcast:test', 'string', 10]);
      });
    });
  });

  describe('`setListener()`', () => {
    let inst: Component;
    let btn: HTMLElement;
    const handler = () => undefined;
    beforeEach(() => {
      inst = new Component();
      btn = document.createElement('button');
      inst.mount(document.createElement('div'));
    });

    it('selects a child element', () => {
      const spy = spyOn(utils, 'qs').and.returnValue(btn);
      inst.setListener('click .listener-btn', handler);
      expect(spy).toHaveBeenCalledWith('.listener-btn', inst.$el);
    });

    it('add an event handler to the selected element', () => {
      spyOn(utils, 'qs').and.returnValue(btn);
      const spy = spyOn(btn, 'addEventListener');
      inst.setListener('click .listener-btn', handler);

      expect(spy).toHaveBeenCalledWith('click', handler);
    });

    it('will add a reference to the internal registry', () => {
      spyOn(utils, 'qs').and.returnValue(btn);
      inst.setListener('click .listener-btn', handler);
      expect(inst.$listeners.get(handler)).toEqual({
        event: 'click',
        element: btn,
      });
    });

    it('will lookup elements reference if the selector starts with "@"', () => {
      inst.$els.btn = btn;
      const spy = spyOn(btn, 'addEventListener');
      inst.setListener('click @btn', handler);
      expect(spy).toHaveBeenCalledWith('click', handler);
    });

    it('attaches an event to the root element if just the event is defined', () => {
      const spy = spyOn(inst.$el, 'addEventListener');
      inst.setListener('click', handler);
      expect(spy).toHaveBeenCalledWith('click', handler);
    });

    it('does nothing if element is not found', () => {
      spyOn(utils, 'qs').and.returnValue(undefined);
      inst.setListener('click .demo', handler);
      expect(inst.$listeners.get(handler)).toBe(undefined);
    });
  });

  describe('`removeListeners()`', () => {
    let inst: Component;
    let btn: HTMLElement;
    const handler = () => undefined;
    beforeEach(() => {
      inst = new Component();
      btn = document.createElement('button');
      inst.mount(document.createElement('div'));

      inst.$listeners.set(handler, {
        event: 'click',
        element: btn,
      });
    });

    it('cycles registered events and unbind them', () => {
      const spy = spyOn(btn, 'removeEventListener');
      inst.removeListeners();
      expect(spy).toHaveBeenCalledWith('click', handler);
    });
  });

  //     describe('`setRef()`', () => {
  //         let inst;
  //         let root;
  //         let Child;
  //         beforeEach(() => {
  //             Child = Component.create();
  //             inst = new Component();
  //             mount('component.html');
  //             root = document.getElementById('ref');
  //             inst.mount(root).init({ a: 1, b: 2 });
  //         });
  //         it('should throw id passed-in argument is not an object', () => {
  //             expect(() => {
  //                 inst.setRef();
  //             }).toThrow();
  //         });
  //         it('should accept a component instance as child', () => {
  //             const childInst = new Child('.child');
  //             expect(() => {
  //                 inst.setRef({ id: 'child', component: childInst });
  //             }).toNotThrow();
  //         });
  //         it('should accept a component constructor as child', () => {
  //             expect(() => {
  //                 inst.setRef({ id: 'child', component: Child, el: '.child' });
  //             }).toNotThrow();
  //         });
  //         it('should throw when a child constructor does not have an el root element', () => {
  //             expect(() => {
  //                 inst.setRef({ id: 'child', component: Child });
  //             }).toThrow();
  //         });
  //         it('should throw when an id is not set', () => {
  //             expect(() => {
  //                 inst.setRef({ id: null, component: Child });
  //             }).toThrow();
  //         });
  //         it('should create a new instance from the passed-in component constructor', () => {
  //             const spy = expect.createSpy();
  //             const opts = { a: 1 };
  //             const MockChild = Component.create({
  //                 constructor(...args) {
  //                     spy(...args);
  //                     return Component.apply(this, args);
  //                 }
  //             });
  //             inst.setRef({
  //                 id: 'child',
  //                 component: MockChild,
  //                 el: '.child',
  //                 opts
  //             });
  //             expect(spy).toHaveBeenCalledWith('.child', opts);
  //         });
  //         it('should throw when the passed-in component is neither an instance nor a constructor with root element', () => {
  //             expect(() => {
  //                 inst.setRef({ id: 'child', component: null });
  //             }).toThrow();
  //         });
  //         it('should create child/parent reference', () => {
  //             const childInst = new Child('.child');
  //             inst.setRef({ id: 'child', component: childInst });
  //             expect(inst.$refs.child).toBe(childInst);
  //         });
  //         it('should add an entry into the `_$refsKeys` array', () => {
  //             const childInst = new Child('.child');
  //             inst.setRef({ id: 'child', component: childInst });
  //             expect(inst._$refsKeys).toContain('child');
  //         });
  //         it('should pass selected state to child', () => {
  //             const component = new Child('.child');
  //             const spy = expect.spyOn(component, 'init').andCallThrough();
  //             const props = { b: 'b' };
  //             const expected = { b: 2 };
  //             inst.setRef({ id: 'child', component, props });
  //             expect(spy.calls[0].arguments[0]).toMatch(expected);
  //         });
  //         it('should return a promise', () => {
  //             const component = new Child('.child');
  //             const ret = inst.setRef({ id: 'child', component });
  //             expect(ret).toBeA(Promise);
  //         });
  //         it('should call previous reference\'s `destroy` method when a new reference is set', () => {
  //             const child = new Child('.child');
  //             const otherChild = new Child(document.createElement('p'));
  //             const spy = expect.spyOn(child, 'destroy').andCallThrough();
  //             inst.$refs.child = child;
  //             const ret = inst.setRef({ id: 'child', component: otherChild });
  //             expect(ret).toBeA(Promise);
  //             expect(spy).toHaveBeenCalled();
  //         });
  //         it('should replace previous reference\'s root element with the new reference `$el`', (done) => {
  //             const child = new Child('.child');
  //             const otherChild = new Child(document.createElement('p'));
  //             const spy = expect.spyOn(inst.$el, 'replaceChild').andCallThrough();
  //             expect.spyOn(inst.$el, 'contains').andReturn(true);
  //             inst.$refs.child = child;
  //             const ret = inst.setRef({ id: 'child', component: otherChild }).then(() => {
  //                 expect(inst.$el.contains).toHaveBeenCalledWith(child.$el);
  //                 expect(spy).toHaveBeenCalledWith(otherChild.$el, child.$el);
  //                 done();
  //             });
  //             expect(ret).toBeA(Promise);
  //         });
  //         it('should append new reference `$el` when previuos `$el` is already detached', (done) => {
  //             const child = new Child('.child');
  //             const otherChild = new Child(document.createElement('p'));
  //             const spy = expect.spyOn(inst.$el, 'appendChild').andCallThrough();
  //             expect.spyOn(inst.$el, 'contains').andReturn(false);
  //             inst.$refs.child = child;
  //             inst.$el.removeChild(child.$el);
  //             const ret = inst.setRef({ id: 'child', component: otherChild }).then(() => {
  //                 expect(inst.$el.contains).toHaveBeenCalledWith(child.$el);
  //                 expect(spy).toHaveBeenCalledWith(otherChild.$el);
  //                 done();
  //             });
  //             expect(ret).toBeA(Promise);
  //         });
  //     });
  //     describe('`setRef()`', () => {
  //         let inst;
  //         let root;
  //         let Child;
  //         beforeEach(() => {
  //             Child = Component.create();
  //             inst = new Component();
  //             mount('component.html');
  //             root = document.getElementById('ref');
  //             inst.mount(root).init({ a: 1, b: 2 });
  //         });
  //         it('should cycle every ref and call its `destroy method`', () => {
  //             const child = new Child(document.createElement('div'));
  //             const spy = expect.spyOn(child, 'destroy').andCallThrough();
  //             inst.$refs.child = child;
  //             inst._$refsKeys.push('child');
  //             inst.closeRefs();
  //             expect(spy).toHaveBeenCalled();
  //         });
  //         it('should return a Promise', () => {
  //             expect(inst.closeRefs()).toBeA(Promise);
  //         });
  //         it('should log any catched error to `console.error`', (done) => {
  //             const child = new Child(document.createElement('div'));
  //             const err = new Error('MOCK');
  //             expect.spyOn(child, 'destroy').andReturn(Promise.reject(err));
  //             const spy = expect.spyOn(console, 'error');
  //             inst.$refs.child = child;
  //             inst._$refsKeys.push('child');
  //             inst.closeRefs().then(() => {
  //                 expect(spy).toHaveBeenCalledWith('close refs', err);
  //                 spy.restore();
  //                 done();
  //             });
  //         });
  //         it('should reset `$refs` and `_$refsKeys` properties', (done) => {
  //             const child = new Child(document.createElement('div'));
  //             inst.$refs.child = child;
  //             inst._$refsKeys.push('child');
  //             inst.closeRefs().then(() => {
  //                 expect(inst.$refs).toMatch({});
  //                 expect(inst._$refsKeys.length).toBe(0);
  //                 done();
  //             });
  //         });
  //     });
  //     describe('`destroy()`', () => {
  //         let inst;
  //         let root;
  //         beforeEach(() => {
  //             inst = new Component();
  //             mount('component.html');
  //             root = document.getElementById('ref');
  //             inst.mount(root).init();
  //         });
  //         it('should call `beforeDestroy` lifecycle hook', () => {
  //             const spy = expect.spyOn(inst, 'beforeDestroy');
  //             inst.destroy();
  //             expect(spy).toHaveBeenCalled();
  //         });
  //         it('should detach any DOM event', () => {
  //             const spy = expect.spyOn(inst.$ev, 'off');
  //             inst.destroy();
  //             expect(spy).toHaveBeenCalled();
  //         });
  //         it('should detach any event handler', () => {
  //             const spy = expect.spyOn(inst, 'off');
  //             inst.destroy();
  //             expect(spy).toHaveBeenCalled();
  //         });
  //         it('should remove the `data-cid ` attribute from the element', () => {
  //             expect(inst.el.hasAttribute('data-cid ')).toBe(true);
  //             inst.destroy();
  //             expect(inst.el.hasAttribute('data-cid ')).toBe(false);
  //         });
  //         it('should call `closeRefs()` and deactivate the instance', (done) => {
  //             const spy = expect.spyOn(inst, 'closeRefs').andCallThrough();
  //             inst.destroy().then(() => {
  //                 expect(inst._active).toBe(false);
  //                 expect(spy).toHaveBeenCalled();
  //                 done();
  //             });
  //         });
  //         it('should return a promise', () => {
  //             expect(inst.destroy()).toBeA(Promise);
  //         });
  //         it('should log any catched error to `console.error`', (done) => {
  //             const err = new Error('MOCK');
  //             expect.spyOn(inst, 'closeRefs').andReturn(Promise.reject(err));
  //             const spy = expect.spyOn(console, 'error');
  //             inst.destroy().then(() => {
  //                 expect(spy).toHaveBeenCalledWith('destroy catch: ', err);
  //                 spy.restore();
  //                 done();
  //             });
  //         });
  //     });
});
