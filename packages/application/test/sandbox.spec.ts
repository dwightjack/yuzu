import { Sandbox, sandboxComponentOptions } from '../src/sandbox';
import * as context from '../src/context';
import { Component } from 'yuzu';
import * as utils from 'yuzu-utils';

/* tslint:disable max-classes-per-file */
describe('`Sandbox`', () => {
  describe('constructor', () => {
    it('extends Component', () => {
      const inst = new Sandbox();
      expect(inst).toEqual(jasmine.any(Component));
    });

    it('assigns prop `id` to $id attribute', () => {
      const inst = new Sandbox({ id: 'demo' });
      expect(inst.$id).toBe('demo');
    });

    it('auto-generates an id if it is not passed in', () => {
      const inst = new Sandbox();
      expect(inst.$id).toMatch(/_sbx-[0-9]+/);
    });

    it('passes `options.root` to mount method', () => {
      const root = document.createElement('div');
      const inst = new Sandbox({ root });
      const spy = spyOn(inst, 'mount').and.callThrough();
      inst.start();
      expect(spy).toHaveBeenCalledWith(root);
    });

    it('sets a data-sandbox attribute on the root element', () => {
      const root = document.createElement('div');
      const inst = new Sandbox({ root, id: 'demo' });
      inst.start();
      expect(root.getAttribute('data-sandbox')).toBe('demo');
    });

    it('creates an internal array to keep track of registered components', () => {
      const root = document.createElement('div');
      const inst = new Sandbox({ root });
      expect(inst.$registry).toEqual(jasmine.any(Array));
    });

    it('creates an internal map to keep track of component instances', () => {
      const root = document.createElement('div');
      const inst = new Sandbox({ root });
      expect(inst.$instances).toEqual(jasmine.any(Map));
    });

    it('calls register() for every passed-in component configuration', () => {
      const root = document.createElement('div');
      class Child extends Component {
        public static root = 'demo';
      }
      const components = [Child];
      const spy = spyOn(Sandbox.prototype, 'register');
      const inst = new Sandbox({ components, root });
      expect(spy).toHaveBeenCalledWith({ component: Child, selector: 'demo' });
    });

    it('calls register() for every passed-in component configuration (with options)', () => {
      const root = document.createElement('div');
      class Child extends Component {
        public static root = 'demo';
      }
      const components = [
        [Child, { selector: 'custom', prop: true }] as sandboxComponentOptions,
      ];
      const spy = spyOn(Sandbox.prototype, 'register');
      const inst = new Sandbox({ components, root });
      expect(spy).toHaveBeenCalledWith({
        component: Child,
        selector: 'custom',
        prop: true,
      });
    });

    it('falls back to the component selector if not defined in the options', () => {
      const root = document.createElement('div');
      class Child extends Component {
        public static root = 'demo';
      }
      const components = [[Child, { prop: true }] as sandboxComponentOptions];
      const spy = spyOn(Sandbox.prototype, 'register');
      const inst = new Sandbox({ components, root });
      expect(spy).toHaveBeenCalledWith({
        component: Child,
        selector: 'demo',
        prop: true,
      });
    });
  });

  describe('.register()', () => {
    let inst: Sandbox;

    beforeEach(() => {
      inst = new Sandbox({ root: document.createElement('div') });
    });

    it('throws if "component" is not a Component constructor', () => {
      spyOn(Component, 'isComponent').and.returnValue(false);
      expect(() => {
        inst.register({ component: Component, selector: 'demo' });
      }).toThrowError(TypeError);
    });

    it('throws if "selector" is not a string', () => {
      expect(() => {
        inst.register({ component: Component, selector: null as any });
      }).toThrowError(TypeError);
    });

    it('pushes the passed-in params to the internal registry', () => {
      const params = { component: Component, selector: 'demo' };
      inst.register(params);
      expect(inst.$registry[0]).toBe(params);
    });
  });
  describe('.start()', () => {
    let inst: Sandbox;
    let root: HTMLElement;
    const params = { component: Component, selector: 'demo' };
    beforeEach(() => {
      root = document.createElement('div');
      inst = new Sandbox({ root });
      inst.$registry = [params];
    });

    it('should create an internal context', () => {
      const mock = context.createContext({});
      const spy = spyOn(context, 'createContext').and.returnValue(mock);
      const ctx = {};
      inst.start(ctx);
      expect(spy).toHaveBeenCalledWith(ctx);
      expect(inst.$ctx).toBe(mock);
    });

    it('injects the context data in the sandbox itself (for inheritance)', () => {
      const mock = {
        inject: jasmine.createSpy('inject'),
      };
      spyOn(context, 'createContext').and.returnValue(mock);
      inst.start({});
      expect(mock.inject).toHaveBeenCalledWith(inst);
    });

    it('should emit a "beforeStart" event', () => {
      const spy = spyOn(inst, 'emit');
      inst.start();
      expect(spy).toHaveBeenCalledWith('beforeStart');
    });

    it('should call `mount` method', () => {
      const spy = spyOn(inst, 'mount').and.callThrough();
      inst.start();
      expect(spy).toHaveBeenCalled();
    });

    it('should abort component initialization if it is already registered', () => {
      const spy = spyOn(inst.$instances, 'has').and.returnValue(true);
      const spyWarn = spyOn(console, 'warn');
      inst.start();
      expect(spy).toHaveBeenCalledWith(Component);
      expect(spyWarn).toHaveBeenCalled();
      expect(inst.$instances.size).toBe(0);
    });

    it('should query the root DOM tree', () => {
      const spy = spyOn(utils, 'qsa').and.returnValue([]);
      inst.start();
      expect(spy).toHaveBeenCalledWith(params.selector, inst.$el);
    });

    it('should call "createInstance" for each matched element', () => {
      const children = [
        document.createElement('div'),
        document.createElement('div'),
      ];

      children.forEach((el) => root.appendChild(el));

      spyOn(utils, 'qsa').and.returnValue(children);
      const spy = spyOn(inst, 'createInstance').and.callThrough();
      inst.$registry[0].demo = true;
      inst.start();
      expect(spy.calls.count()).toBe(2);
      const calls = spy.calls.allArgs();
      calls.forEach((args, i) => {
        expect(args).toEqual([Component, { demo: true }, children[i]]);
      });
    });

    it('skips if the element has "data-skip"', () => {
      const child = document.createElement('div');
      root.appendChild(child);
      child.setAttribute('data-skip', '');
      spyOn(utils, 'qsa').and.returnValue([child]);
      const spy = spyOn(inst, 'createInstance').and.callThrough();
      inst.start();
      expect(spy).not.toHaveBeenCalled();
    });

    it('skips if the element is not a child of the root sandbox', () => {
      const child = document.createElement('div');
      const spy = spyOn(inst, 'createInstance').and.callThrough();
      spyOn(utils, 'qsa').and.returnValue([child]);
      inst.start();
      expect(spy).not.toHaveBeenCalled();

      const mid = document.createElement('div');

      // child is nested inside another sandbox
      mid.setAttribute('data-sandbox', 'mid');
      mid.appendChild(child);
      root.appendChild(mid);
      expect(spy).not.toHaveBeenCalled();
    });

    it('skips if the element is inside a [data-skip] element', () => {
      const child = document.createElement('div');
      const spy = spyOn(inst, 'createInstance').and.callThrough();
      const mid = document.createElement('div');

      spyOn(utils, 'qsa').and.returnValue([child]);

      // child is nested inside a [data-skip] element
      mid.setAttribute('data-skip', '');
      mid.appendChild(child);
      root.appendChild(mid);

      inst.start();

      expect(spy).not.toHaveBeenCalled();
    });

    it('sets a record with component instances', (done) => {
      const child = document.createElement('div');
      root.appendChild(child);

      spyOn(utils, 'qsa').and.returnValue([child]);
      const childInstance = new Component();
      spyOn(inst, 'createInstance').and.returnValue(childInstance);
      const spy = spyOn(inst.$instances, 'set');
      inst.start();

      setTimeout(() => {
        expect(spy).toHaveBeenCalledWith(Component, [childInstance]);
        done();
      }, 0);
    });

    it('emits a "start" event', (done) => {
      const spy = spyOn(inst, 'emit');
      inst.start();
      setTimeout(() => {
        expect(spy).toHaveBeenCalledWith('start');
        done();
      });
    });
  });

  describe('.createInstance()', () => {
    let inst: Sandbox;
    let root: HTMLElement;
    let el: HTMLElement;

    beforeEach(() => {
      el = document.createElement('div');
      root = document.createElement('div');
      inst = new Sandbox({ root }).start();
    });

    it('initializes a child instance', () => {
      const spy = jasmine.createSpy('created');
      const options = {};
      class Child extends Component {
        constructor(opts: any) {
          super(opts);
          spy(this, opts);
        }
      }
      inst.createInstance(Child, options, el);
      expect(spy).toHaveBeenCalledWith(jasmine.any(Child), options);
    });

    it('sets the component as sandbox child ref', () => {
      const spy = spyOn(inst, 'setRef');
      const options = { demo: true };
      class Child extends Component {
        constructor(opts: any) {
          super(opts);
          spy(this, opts);
        }
      }
      inst.createInstance(Child, options, el);
      expect(spy).toHaveBeenCalledWith({
        component: Child,
        el,
        id: jasmine.any(String),
        ...options,
      });
    });

    it('returns a the setRef result', async () => {
      // const val = new Component();
      // spyOn(inst, 'setRef').and.returnValue(val);
      const ret = await inst.createInstance(Component, {}, el);
      expect(ret).toEqual(jasmine.any(Component));
    });

    it('extracts inline options and passes it to the constructor', () => {
      const spy = jasmine.createSpy('created');
      const options = { demo: true };
      class Child extends Component {
        constructor(opts: any) {
          super(opts);
          spy(opts);
        }
      }
      spyOn(utils, 'datasetParser').and.returnValue({
        inline: true,
      });
      inst.createInstance(Child, options, el);
      expect(spy).toHaveBeenCalledWith({ demo: true, inline: true });
    });

    // it('injects the context', () => {
    //   class Child extends Component {}

    //   const spy = jasmine.createSpy('inject');

    //   inst.$context = context.createContext();
    //   inst.$context.inject = spy;

    //   inst.createInstance(Child, {}, el);
    //   expect(spy).toHaveBeenCalledWith(jasmine.any(Child));
    // });

    // it('mounts the instance', () => {
    //   class Child extends Component {}
    //   const spy = spyOn(Child.prototype, 'mount');

    //   inst.createInstance(Child, {}, el);
    //   expect(spy).toHaveBeenCalledWith(el);
    // });
  });

  describe('.stop()', () => {
    let inst: Sandbox;
    let spy: any;
    class Child extends Component {}
    class GrandChild extends Component {}

    beforeEach(() => {
      spy = jasmine
        .createSpy('destroy')
        .and.returnValue(Promise.resolve('ret'));
      Child.prototype.destroy = spy;
      GrandChild.prototype.destroy = spy;

      inst = new Sandbox({ root: document.createElement('div') });
      inst.$instances.set(Child, [
        new Child().mount(document.createElement('div')),
      ]);
      inst.$instances.set(GrandChild, [
        new GrandChild().mount(document.createElement('div')),
      ]);
    });
    it('returns a promise', () => {
      expect(inst.stop()).toEqual(jasmine.any(Promise));
    });
    // it('cycles stored instances and calls destroy on them', async () => {
    //   await inst.stop();
    //   expect(spy.calls.count()).toBe(2);
    // });
    it('calls beforeDestroy hook', async () => {
      const hookSpy = spyOn(inst, 'beforeDestroy');
      await inst.stop();
      expect(hookSpy).toHaveBeenCalled();
    });

    it('calls beforeDestroy hook', async () => {
      const hookSpy = spyOn(inst, 'beforeDestroy');
      await inst.stop();
      expect(hookSpy).toHaveBeenCalled();
    });

    it('calls `removeListeners` method', async () => {
      const removeSpy = spyOn(inst, 'removeListeners');
      await inst.stop();
      expect(removeSpy).toHaveBeenCalled();
    });

    it('calls destroyRefs and waits until the destroy promises are resolved', async () => {
      const destroySpy = spyOn(inst, 'destroyRefs');
      await inst.stop();
      expect(destroySpy).toHaveBeenCalled();
    });

    it('rejects if something goes wrong', () => {
      spy.and.throwError('MOCK');
      return inst.stop().catch((e) => {
        expect(e.message).toBe('MOCK');
      });
    });

    it('clears the instances register', async () => {
      await inst.stop();
      expect(inst.$instances.size).toBe(0);
    });

    it('sets the `$active` property to false', async () => {
      await inst.stop();
      expect(inst.$active).toBe(false);
    });

    it('calls "clear()"', async () => {
      const clearSpy = spyOn(inst, 'clear');
      await inst.stop();
      expect(clearSpy).toHaveBeenCalled();
    });

    it('emits  "beforeStop" asap', () => {
      const emitSpy = spyOn(inst, 'emit');
      inst.stop();
      expect(emitSpy).toHaveBeenCalledWith('beforeStop');
    });

    it('emits  "stop" after the process has ended', (done) => {
      const emitSpy = spyOn(inst, 'emit');
      inst.stop().then(() => {
        expect(emitSpy).toHaveBeenCalledWith('stop');
        done();
      });
      expect(emitSpy).not.toHaveBeenCalledWith('stop');
    });

    it('emits  "error" on error', async () => {
      const emitSpy = spyOn(inst, 'emit');
      const err = new Error('MOCK');
      spy.and.throwError(err);

      try {
        await inst.stop();
      } catch {
        expect(emitSpy).toHaveBeenCalledWith('error', err);
      }
    });
  });

  describe('.clear()', () => {
    let inst: Sandbox;

    beforeEach(() => {
      inst = new Sandbox({ root: document.createElement('div') });
      inst.$ctx = context.createContext({});
    });

    it('clears the context', () => {
      inst.clear();
      expect(inst.$ctx).toBeUndefined();
    });

    it('detaches events', () => {
      const spyEmit = spyOn(inst, 'off');
      inst.clear();
      ['beforeStart', 'start', 'beforeStop', 'stop'].forEach((event) => {
        expect(spyEmit).toHaveBeenCalledWith(event);
      });
    });
  });
});
/* tslint:enable max-classes-per-file */
