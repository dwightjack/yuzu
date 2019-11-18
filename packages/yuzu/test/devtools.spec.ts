import { Component } from '../src/component';
import { devtools, YuzuRoot } from '../src/devtools';
import { fn, IStateLogger } from '../types';

type ILogger = IStateLogger<Component, {}>;

describe('`devtools`', () => {
  let el: HTMLElement;
  let inst: Component;
  let mount: any;
  let init: any;

  class Child extends Component {}

  beforeAll(() => {
    mount = Component.prototype.mount;
    init = Component.prototype.init;
    devtools(Component);
  });

  beforeEach(() => {
    el = document.createElement('div');
    inst = new Child().mount(el, null);
  });

  it('attaches a $yuzu property at init', () => {
    expect((inst.$el as YuzuRoot).$yuzu).toBe(inst);
  });

  describe('$$logStart', () => {
    it('attaches a $$logStart property at init', () => {
      inst.init();
      expect(inst.$$logStart).toEqual(jasmine.any(Function));
    });

    it('initilizes a $$logger property', () => {
      inst.init();
      (inst.$$logStart as fn)('LABEL');
      expect(inst.$$logger).not.toBeUndefined();
      expect((inst.$$logger as ILogger).label).toBe('LABEL');
    });

    it('subscribes to the "change:*" state event', () => {
      inst.init();
      (inst.$$logStart as fn)('LABEL', false);

      const spy = spyOn(inst.$$logger as ILogger, 'subscribe');

      (inst.$$logStart as fn)('LABEL');
      expect(spy).toHaveBeenCalledWith(inst, 'change:*');

      (inst.$$logStart as fn)('LABEL', 'change:my');
      expect(spy).toHaveBeenCalledWith(inst, 'change:my');
    });

    it('does NOT execute subscribe if the second argment is "false"', () => {
      inst.init();
      (inst.$$logStart as fn)('LABEL', false);

      const spy = spyOn(inst.$$logger as ILogger, 'subscribe');

      (inst.$$logStart as fn)('LABEL', false);
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('$$logStart', () => {
    it('attaches a $$logEnd property at init', () => {
      inst.init();
      expect(inst.$$logEnd).toEqual(jasmine.any(Function));
    });

    it('does NOT break if called before $$logStart', () => {
      inst.init();
      expect(() => {
        (inst.$$logEnd as fn)();
      }).not.toThrow();
    });

    it('calls unsubscribe when an event is specified', () => {
      inst.init();
      (inst.$$logStart as fn)('LABEL', false);
      const spy = spyOn(inst.$$logger as ILogger, 'unsubscribe');
      (inst.$$logEnd as fn)('EVENT');
      expect(spy).toHaveBeenCalledWith(inst, 'EVENT');
    });

    it('calls unsubscribeAll when an event is NOT specified', () => {
      inst.init();
      (inst.$$logStart as fn)('LABEL', false);
      const spy = spyOn(inst.$$logger as ILogger, 'unsubscribeAll');
      (inst.$$logEnd as fn)();
      expect(spy).toHaveBeenCalledWith(inst);
    });
  });

  it('removes $$logStart on destroy', async () => {
    await inst.destroy();
    expect(inst.$$logStart).toBeUndefined();
  });

  it('removes $$logEnd on destroy', async () => {
    await inst.destroy();
    expect(inst.$$logEnd).toBeUndefined();
  });

  it('removes $yuzu on destroy', async () => {
    await inst.destroy();
    expect((inst.$el as YuzuRoot).$yuzu).toBeUndefined();
  });

  it('does not throw if $yuzu is not defined', async () => {
    let e: any;
    Object.defineProperty(inst.$el, '$yuzu', {
      configurable: true,
      value: undefined,
    });

    try {
      await inst.destroy();
    } catch (err) {
      e = err;
    }
    expect(e).toBeUndefined();
  });

  it('does not throw if $el is not defined', async () => {
    let e: any;
    (inst.$el as any) = undefined;

    try {
      await inst.destroy();
    } catch (err) {
      e = err;
    }
    expect(e).toBeUndefined();
  });

  afterAll(() => {
    Component.prototype.mount = mount;
    Component.prototype.init = init;
  });
});
