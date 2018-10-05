import { mount as mountHTML } from '../../../shared/utils';
import { Component } from '../src/component';
import { mount } from '../src/mount';
import * as utils from 'yuzu-utils';

describe('`mount`', () => {
  describe('Mounter function setup', () => {
    let root: HTMLElement;
    let spy: any;
    let Fake: any;

    beforeEach(() => {
      spy = jasmine.createSpy();
      root = document.createElement('div');
      Fake = class extends Component {
        constructor(...args: any[]) {
          super(...args);
          spy.apply(this, args);
        }
      };
    });
    it('should create a new instance from the component constructor', () => {
      mount(Fake, root);

      expect(spy).toHaveBeenCalled();
      expect(spy.calls.mostRecent().object.constructor).toBe(Fake);
    });

    it('should pass provided options to the constructor', () => {
      const options = {
        demo: true,
      };
      mount(Fake, root, options);
      expect(spy).toHaveBeenCalledWith(options);
    });

    it('should NOT include reserved "id" and "state" props', () => {
      const state = {};
      const options = {
        demo: true,
        id: 'demo',
        state,
      };
      mount(Fake, root, options);
      const opts = spy.calls.mostRecent().args[0];
      expect(opts).toEqual({
        demo: true,
      });
    });

    it('should return a function', () => {
      expect(mount(Fake, root)).toEqual(jasmine.any(Function));
    });
  });

  describe('Mounter function', () => {
    beforeEach(() => {
      mountHTML('component.html');
    });

    it('should resolve to an element when a context is passed-in', () => {
      const ctx = new Component().mount('#ref');
      const child = ctx.$el.querySelector('.child');
      const mounter = mount(Component, '.child');
      const spy = spyOn(utils, 'qs').and.returnValue(child);

      mounter(ctx);

      expect(spy).toHaveBeenCalledWith('.child', ctx.$el);
    });

    it('should call `.mount()` on generated component', () => {
      const root = document.getElementById('app');

      class MyComponent extends Component {} // tslint:disable-line
      const spy = spyOn(MyComponent.prototype, 'mount').and.callThrough();

      if (root) {
        mount(MyComponent, root)();
      }
      expect(spy).toHaveBeenCalledWith(root, {});
    });

    it('should NOT call `.mount()` on generated component if root is not an element', () => {
      const root: any = null;

      class MyComponent extends Component {} // tslint:disable-line
      const spy = spyOn(MyComponent.prototype, 'mount');

      mount(MyComponent, root)();
      expect(spy).not.toHaveBeenCalled();
    });

    it('should initialize generated component with provided state', () => {
      class MyComponent extends Component {} // tslint:disable-line
      const spy = spyOn(MyComponent.prototype, 'mount');
      const state = {};
      const root = document.getElementById('app') as HTMLElement;

      mount(MyComponent, root, { state })();

      expect(spy).toHaveBeenCalledWith(root, state);
    });

    it('should return a component instance', () => {
      class MyComponent extends Component {} // tslint:disable-line

      const component = mount(MyComponent, '#app')();

      expect(component).toEqual(jasmine.any(Component));
    });

    it('should NOT pass the state if a context is provided', () => {
      const ctx = new Component().mount('#ref');
      class MyComponent extends Component {} // tslint:disable-line
      const spy = spyOn(MyComponent.prototype, 'mount').and.callThrough();
      const state = {};
      mount(MyComponent, '.child', { state })(ctx);

      expect(spy).toHaveBeenCalledWith(document.querySelector('.child'), null);
    });

    it('should set the generated component as a child of its context', () => {
      const ctx = new Component().mount('#ref');
      const spy = spyOn(ctx, 'setRef');
      class MyComponent extends Component {} // tslint:disable-line

      const state = {};
      const component = mount(MyComponent, '.child', { state })(ctx);

      expect(spy).toHaveBeenCalledWith(
        {
          component,
          id: jasmine.any(String),
        },
        state,
      );
    });
  });

  describe('Children management', () => {
    it('should execute child-as-a-function children argument', () => {
      const spy = jasmine.createSpy().and.returnValue([]);
      class MyComponent extends Component {} // tslint:disable-line

      const component = mount(MyComponent, '#app', null, spy)();

      expect(spy).toHaveBeenCalledWith(component);
    });

    it('should iterate over children function and execute them with the component as context', () => {
      const spy = jasmine.createSpy();
      class MyComponent extends Component {} // tslint:disable-line
      const children = [spy, spy];
      const component = mount(MyComponent, '#app', null, children)();

      const calls = spy.calls.all();

      expect(calls.length).toBe(children.length);
      calls.forEach(({ args }) => {
        expect(args[0]).toBe(component);
      });
    });
  });
});
