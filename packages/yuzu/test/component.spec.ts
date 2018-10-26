import { Component } from '../src/component';
import { mount } from '../../../shared/utils';
import * as utils from 'yuzu-utils';

/* tslint:disable max-classes-per-file */
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

    it('extends utils.Events', () => {
      expect(inst).toEqual(jasmine.any(utils.Events));
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
    it('should throw if the component is detached', () => {
      expect(() => {
        inst.detached = true;
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

    it('should resolve arrays of child elements selectors', () => {
      const children = [document.createElement('div')];
      const spy = spyOn(utils, 'qsa').and.returnValue(children);
      inst.selectors = {
        'children[]': '.child-demo',
      };
      inst.mount(root);
      expect(spy).toHaveBeenCalledWith('.child-demo', root);
      expect(inst.$els.children).toEqual(children);
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
    it('should NOT check $el on detached components', () => {
      spyOn(utils, 'isElement').and.returnValue(false);
      expect(() => {
        inst.detached = true;
        inst.init();
      }).not.toThrow();
    });
    it('should check if a component has already been initialized on the DOM element', () => {
      const spy = spyOn(console, 'warn');
      const uid = 'fake-uid';
      root.setAttribute(Component.UID_DATA_ATTR, uid);
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
      expect(root.getAttribute(Component.UID_DATA_ATTR)).toBe(inst.$uid);
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
      root.setAttribute(Component.UID_DATA_ATTR, 'fake-id');
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

    it('will cycle when references are arrays', () => {
      inst.$els.btn = [btn, btn];
      const spy = spyOn(btn, 'addEventListener');
      inst.setListener('click @btn', handler);
      expect(spy.calls.count()).toBe(2);
    });

    it('will add the element index as second argument', () => {
      inst.$els.btn = [btn, btn];
      const spy = jasmine.createSpy();
      inst.setListener('click @btn', spy);
      const event = new MouseEvent('click');
      btn.dispatchEvent(event);
      expect(spy.calls.argsFor(0)).toEqual([event, 0]);
      expect(spy.calls.argsFor(1)).toEqual([event, 1]);
    });

    it('will keep the context', () => {
      class Custom extends Component {
        public onClick() {
          return true;
        }
        public initialize() {
          this.$els.btn = [btn, btn];
        }
      }
      const inst2 = new Custom().mount(document.createElement('div'));
      const spy = spyOn(inst2, 'onClick');
      inst2.setListener('click @btn', inst2.onClick);
      const event = new MouseEvent('click');
      btn.dispatchEvent(event);
      expect(spy.calls.mostRecent().object).toBe(inst2);
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

  describe('`setRef()`', () => {
    let inst: Component;
    let root: HTMLElement;
    const options = {};
    const cfg = {
      el: document.createElement('div'),
      component: Component,
      id: 'child',
      options,
    };
    beforeEach(() => {
      root = document.createElement('div');
      inst = new Component().mount(root);
    });
    it('throws if passed-in parameter is not an object', async () => {
      spyOn(utils, 'isPlainObject').and.returnValue(false);
      let e: any;
      try {
        await inst.setRef(cfg);
      } catch (err) {
        e = err;
      }
      expect(e).toEqual(jasmine.any(TypeError));
    });

    it('throws if setting a component with root as child of a detached component', async () => {
      inst.detached = true;
      let e: any;
      try {
        await inst.setRef(cfg);
      } catch (err) {
        e = err;
      }
      expect(e).toEqual(jasmine.any(Error));
    });

    it('calls component constructors with options', () => {
      spyOn(Component, 'isComponent').and.returnValue(true);
      const el = document.createElement('div');
      const spy = jasmine.createSpy();
      const childOpts = {};
      class Child extends Component {
        constructor(opts = {}) {
          super(opts);
          spy(this, options);
        }
      }
      inst.setRef({
        el,
        id: 'child',
        component: Child,
        options: childOpts,
      });

      expect(spy).toHaveBeenCalledWith(jasmine.any(Child), childOpts);
    });

    it('calls component if it is a plain function', () => {
      const spy = jasmine.createSpy().and.returnValue(new Component());
      const el = document.createElement('div');

      inst.setRef({
        id: 'child',
        el,
        component: spy,
      });

      expect(spy).toHaveBeenCalledWith(el, inst.state);
    });

    it('accepts a child instance', async () => {
      const el = document.createElement('div');
      const component = new Component();
      let e: any;

      try {
        inst.setRef({
          id: 'child',
          el,
          component,
        });
      } catch (err) {
        e = err;
      }

      expect(e).not.toEqual(jasmine.any(TypeError));
    });

    it('inherits parent context if present', () => {
      inst.$context = {};
      const component = new Component();
      const el = document.createElement('div');

      inst.setRef({
        id: 'child',
        el,
        component,
      });

      expect(component.$context).toBe(inst.$context);
    });

    it('throws if "id" is not set', async () => {
      const id: any = null;
      let e: any;
      try {
        await inst.setRef({
          id,
          el: document.createElement('div'),
          component: Component,
        });
      } catch (err) {
        e = err;
      }

      expect(e).toEqual(jasmine.any(Error));
    });

    it('binds child instance events', () => {
      const on = {
        run: () => undefined,
      };
      const child = new Component();
      const spy = spyOn(child, 'on');
      const config = {
        ...cfg,
        on,
        component: child,
      };
      inst.setRef(config);

      expect(spy).toHaveBeenCalledWith('run', on.run);
    });

    it('stores a reference of the child component', () => {
      const child = new Component();
      const config = {
        ...cfg,
        component: child,
      };
      inst.setRef(config);
      expect(inst.$refsStore.get(cfg.id)).toBe(child);
    });

    it('mounts the child component', () => {
      const child = new Component();
      const spy = spyOn(child, 'mount').and.callThrough();
      const config = {
        ...cfg,
        component: child,
      };
      inst.setRef(config);
      expect(spy).toHaveBeenCalledWith(cfg.el, null);
    });

    it('does NOT mount if the child component is already mounted', () => {
      const child = new Component();
      child.$el = cfg.el;
      const spy = spyOn(child, 'mount').and.callThrough();
      const config = {
        ...cfg,
        component: child,
      };
      inst.setRef(config);
      expect(spy).not.toHaveBeenCalled();
    });

    it('does NOT mount if el is falsy', () => {
      const child = new Component();

      const spy = spyOn(child, 'mount').and.callThrough();
      const config = {
        ...cfg,
        el: null as any,
        component: child,
      };
      inst.setRef(config);
      expect(spy).not.toHaveBeenCalled();
    });

    it('does NOT mount if the component is detached', () => {
      const child = new Component();
      child.detached = true;

      const spy = spyOn(child, 'mount').and.callThrough();
      const config = {
        ...cfg,
        component: child,
      };
      inst.setRef(config);
      expect(spy).not.toHaveBeenCalled();
    });

    it('inits the child component', () => {
      const child = new Component();

      const spy = spyOn(child, 'init').and.callThrough();
      const config = {
        ...cfg,
        component: child,
      };
      inst.setRef(config);
      expect(spy).toHaveBeenCalled();
    });

    it('inits the child component with passed-in state', () => {
      const child = new Component();

      const spy = spyOn(child, 'init').and.callThrough();
      const config = {
        ...cfg,
        component: child,
      };
      inst.setRef(config, { demo: true });
      expect(spy).toHaveBeenCalledWith({ demo: true });
    });

    it('processes passed-in state values if functions', () => {
      const child = new Component();

      const spy = spyOn(child, 'init').and.callThrough();
      const handler = jasmine.createSpy().and.returnValue(true);
      const state = {
        value: handler,
      };
      const config = {
        ...cfg,
        component: child,
      };
      inst.setRef(config, state);

      expect(handler).toHaveBeenCalledWith(inst.state, child);
      expect(spy).toHaveBeenCalledWith({ value: true });
    });

    it('propagates parent state change to the child', () => {
      const child = new Component();

      const handler = jasmine.createSpy().and.returnValue(true);
      const spy = spyOn(child, 'setState');
      const state = {
        value: handler,
      };
      const config = {
        ...cfg,
        component: child,
      };
      inst.setRef(config, state);

      const newState = {};
      inst.emit('change:*', newState);
      expect(handler).toHaveBeenCalledWith(newState, child);
      expect(spy).toHaveBeenCalledWith({ value: true });
    });

    it('listen for a specific parent state key change', () => {
      const child = new Component();
      inst.state = {
        parent: 0,
      };
      const handler = jasmine.createSpy().and.returnValue(true);
      const spy = spyOn(child, 'setState');
      const state = {
        'parent>value': handler,
      };
      const config = {
        ...cfg,
        component: child,
      };
      inst.setRef(config, state);

      expect(handler).toHaveBeenCalledWith(0, child);
      inst.emit('change:*', {});
      expect(spy).not.toHaveBeenCalled();

      inst.emit('change:parent', 2, 0);
      expect(spy).toHaveBeenCalledWith({ value: true });
    });

    it('destroys any previous reference registered with the same name', () => {
      const prev = new Component().mount(document.createElement('div'));
      const spy = spyOn(prev, 'destroy').and.callThrough();
      inst.$refs.child = prev;

      inst.setRef(cfg);

      expect(spy).toHaveBeenCalled();
    });

    it('replaces the old reference DOM element with the new one', async () => {
      const prevEl = document.createElement('div');
      const prev = new Component().mount(prevEl);
      const newEl = document.createElement('div');
      inst.$refs.child = prev;
      inst.$el.appendChild(prevEl);
      const spy = spyOn(inst.$el, 'replaceChild');

      await inst.setRef({ ...cfg, el: newEl });
      expect(spy).toHaveBeenCalledWith(newEl, prevEl);
    });

    it('it appends the new child if the previous element is NOT in the DOM', async () => {
      const prevEl = document.createElement('div');
      const prev = new Component().mount(prevEl);
      const newEl = document.createElement('div');
      inst.$refs.child = prev;
      const spy = spyOn(inst.$el, 'replaceChild');
      const spy2 = spyOn(inst.$el, 'appendChild');

      await inst.setRef({ ...cfg, el: newEl });
      expect(spy).not.toHaveBeenCalled();
      expect(spy2).toHaveBeenCalledWith(newEl);
    });

    it('just appends the element if it is not already a child of the parent', async () => {
      const newEl = document.createElement('div');
      const spy = spyOn(inst.$el, 'appendChild');
      const spy2 = spyOn(inst.$el, 'contains').and.returnValue(false);
      await inst.setRef({ ...cfg, el: newEl });
      expect(spy).toHaveBeenCalledWith(newEl);
      expect(spy2).toHaveBeenCalledWith(newEl);
    });

    it('just skips append the child', async () => {
      const newEl = document.createElement('div');
      const spy = spyOn(inst.$el, 'appendChild');
      spyOn(inst.$el, 'contains').and.returnValue(true);
      await inst.setRef({ ...cfg, el: newEl });
      expect(spy).not.toHaveBeenCalled();
    });

    it('inits the component with the computed state', async () => {
      const child = new Component();
      const state = { demo: true };
      const spy = spyOn(child, 'init');
      await inst.setRef({ ...cfg, component: child }, state);
      expect(spy).toHaveBeenCalledWith(state);
    });

    it('returns a promise that resolves to the child instance', async () => {
      const child = new Component();
      const promise = inst.setRef({ ...cfg, component: child });
      expect(promise).toEqual(jasmine.any(Promise));
      const res = await promise;
      expect(res).toBe(child);
    });
  });

  describe('`.destroyRef`', () => {
    let inst: Component;
    let child: Component;

    beforeEach(() => {
      inst = new Component();
      child = new Component();
      inst.$refs.child = child;
      inst.$refsStore.set('child', child);
    });

    it('should throw if a ref is not found`', async () => {
      let err: any;
      try {
        await inst.destroyRef('random');
      } catch (e) {
        err = e;
      }
      expect(err).toEqual(jasmine.any(Error));
    });

    it('should call the destroy method of the child component', async () => {
      const spy = spyOn(child, 'destroy');
      await inst.destroyRef('child');
      expect(spy).toHaveBeenCalled();
    });

    it('should remove the reference from $refs and $refsStore', async () => {
      await inst.destroyRef('child');
      expect(inst.$refs.hasOwnProperty('child')).toBe(false);
      expect(inst.$refsStore.has('child')).toBe(false);
    });

    it('should detach the child root element as well', async () => {
      child.$el = document.createElement('div');
      inst.$el = document.createElement('div');
      inst.$el.appendChild(child.$el);
      const spy = spyOn(inst.$el, 'removeChild');

      await inst.destroyRef('child', true);
      expect(spy).toHaveBeenCalledWith(child.$el);
    });
  });

  describe('`.destroyRefs`', () => {
    let inst: Component;
    let child: Component;

    beforeEach(() => {
      inst = new Component();
      child = new Component();
      inst.$refs.child = child;
      inst.$refsStore.set('child', child);
    });

    it('should cycle every ref and call its `destroy method`', async () => {
      const spy = spyOn(child, 'destroy');
      await inst.destroyRefs();
      expect(spy).toHaveBeenCalled();
    });

    it('should clear the reference store', async () => {
      const spy = spyOn(inst.$refsStore, 'clear');
      await inst.destroyRefs();
      expect(Object.keys(inst.$refs).length).toBe(0);
      expect(spy).toHaveBeenCalled();
    });

    it('should return a Promise', () => {
      expect(inst.destroyRefs()).toEqual(jasmine.any(Promise));
    });

    it('should log any caught error to `console.error`', (done) => {
      spyOn(child, 'destroy').and.throwError('MOCK');

      const spy = spyOn(console, 'error');

      inst.destroyRefs().catch(() => {
        expect(spy).toHaveBeenCalledWith(
          jasmine.any(String),
          jasmine.any(Error),
        );
        done();
      });
    });
  });

  describe('`destroy()`', () => {
    let inst: Component;

    beforeEach(() => {
      inst = new Component();
      inst.mount(document.createElement('div'));
    });

    it('should call `beforeDestroy` lifecycle hook', async () => {
      const spy = spyOn(inst, 'beforeDestroy');

      await inst.destroy();
      expect(spy).toHaveBeenCalled();
    });

    it('should detach any DOM listener', async () => {
      const spy = spyOn(inst, 'removeListeners');

      await inst.destroy();
      expect(spy).toHaveBeenCalled();
    });

    it('should detach any event', async () => {
      const spy = spyOn(inst, 'off');

      await inst.destroy();
      expect(spy).toHaveBeenCalled();
    });

    it('should remove the `data-cid` attribute from the element', async () => {
      const spy = spyOn(inst.$el, 'removeAttribute');

      await inst.destroy();
      expect(spy).toHaveBeenCalledWith(Component.UID_DATA_ATTR);
    });

    it('should call `destroyRefs()` and deactivate the instance', async () => {
      const spy = spyOn(inst, 'destroyRefs');

      await inst.destroy();

      expect(inst.$active).toBe(false);
      expect(spy).toHaveBeenCalled();
    });

    it('should return a promise', () => {
      expect(inst.destroy()).toEqual(jasmine.any(Promise));
    });

    it('should log any caught error to `console.error`', (done) => {
      spyOn(inst, 'destroyRefs').and.throwError('MOCK');

      const spy = spyOn(console, 'error');

      inst.destroy().catch(() => {
        expect(spy).toHaveBeenCalledWith('destroy catch: ', jasmine.any(Error));
        done();
      });
    });
  });
});
/* tslint:enable max-classes-per-file */
