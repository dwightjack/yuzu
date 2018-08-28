import { mount as mountHTML } from '../../../shared/utils';
import { Component } from '../src/component';
import { mount } from '../src/mount';
import * as utils from '@yuzu/utils';

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

    it('should NOT initialize generated component if a context is provided', () => {
      const ctx = new Component().mount('#ref');
      spyOn(ctx, 'setRef'); // inhibit setRef
      class MyComponent extends Component {} // tslint:disable-line
      const spy = spyOn(MyComponent.prototype, 'init').and.callThrough();

      mount(MyComponent, '.child')(ctx);

      expect(spy).not.toHaveBeenCalled();
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

    //   it('should initialize generated component with provided state', () => {
    //     const MyComponent = Component.create();
    //     const spy = expect.spyOn(MyComponent.prototype, 'init').andCallThrough();
    //     const state = {};

    //     mount(MyComponent, '#app')(state);

    //     expect(spy).toHaveBeenCalledWith(state);
    //   });

    //   it('should return a component instance', () => {
    //     const MyComponent = Component.create();

    //     const returned = mount(MyComponent, '#app')();

    //     expect(returned).toBeA(MyComponent);
    //   });
  });

  // describe('Children management', () => {
  //   it('should execute child-as-a-function children argument', () => {
  //     const spy = jasmine.createSpy().andReturn([]);
  //     const MyComponent = Component.create();

  //     mount(MyComponent, '#app', null, spy)();

  //     expect(spy).toHaveBeenCalled();
  //     expect(spy.calls[0].arguments.length).toBe(1);
  //     expect(spy.calls[0].arguments[0]).toBeA(MyComponent);
  //   });

  //   it('should cycle children and call them with no state and root component as arguments', () => {
  //     const spy = expect
  //       .createSpy()
  //       .andReturn(new Component(document.createElement('div')));
  //     const MyComponent = Component.create();

  //     mount(MyComponent, '#app', null, [spy, spy])();

  //     expect(spy.calls.length).toBe(2);

  //     for (let i = 0; i < spy.calls.length; i += 1) {
  //       const call = spy.calls[i];
  //       expect(call.arguments.length).toBe(2);
  //       expect(call.arguments[0]).toBe(undefined);
  //       expect(call.arguments[1]).toBeA(MyComponent);
  //     }
  //   });

  //   it('should cycle children as-a-function results', () => {
  //     const spy = expect
  //       .createSpy()
  //       .andReturn(new Component(document.createElement('div')));
  //     const MyComponent = Component.create();

  //     mount(MyComponent, '#app', null, () => [spy, spy])();

  //     expect(spy.calls.length).toBe(2);

  //     for (let i = 0; i < spy.calls.length; i += 1) {
  //       const call = spy.calls[i];
  //       expect(call.arguments.length).toBe(2);
  //       expect(call.arguments[0]).toBe(undefined);
  //       expect(call.arguments[1]).toBeA(MyComponent);
  //     }
  //   });

  //   it('should attach children to root component', () => {
  //     const child = () => new Component(document.createElement('div'));
  //     const MyComponent = Component.create();
  //     const spy = expect.spyOn(MyComponent.prototype, 'setRef');

  //     mount(MyComponent, '#app', null, [child])();

  //     expect(spy).toHaveBeenCalled();
  //   });

  //   it('should pass child component instance', () => {
  //     const childInstance = new Component(document.createElement('div'));
  //     const child = () => childInstance;
  //     const MyComponent = Component.create();
  //     const spy = expect.spyOn(MyComponent.prototype, 'setRef');

  //     mount(MyComponent, '#app', null, [child])();
  //     const arg = spy.calls[0].arguments[0];
  //     expect(arg.component).toBe(childInstance);
  //   });

  //   it('should assign `options.id` as the reference id', () => {
  //     const childInstance = new Component(document.createElement('div'), {
  //       id: 'X',
  //     });
  //     const child = () => childInstance;
  //     const MyComponent = Component.create();
  //     const spy = expect.spyOn(MyComponent.prototype, 'setRef');

  //     mount(MyComponent, '#app', null, [child])();
  //     const arg = spy.calls[0].arguments[0];
  //     expect(arg.id).toBe('X');
  //   });

  //   it('should assign an auto-generated id if NOTprovided', () => {
  //     const childInstance = new Component(document.createElement('div'));
  //     const child = () => childInstance;
  //     const MyComponent = Component.create();
  //     const spy = expect.spyOn(MyComponent.prototype, 'setRef');

  //     const root = mount(MyComponent, '#app', null, [child])();
  //     const arg = spy.calls[0].arguments[0];
  //     expect(arg.id).toBe(`${root._uid}__0`);
  //   });

  //   it('should pass configured props to the reference', () => {
  //     const props = {};
  //     const childInstance = new Component(document.createElement('div'), {
  //       props,
  //     });
  //     const child = () => childInstance;
  //     const MyComponent = Component.create();
  //     const spy = expect.spyOn(MyComponent.prototype, 'setRef');

  //     mount(MyComponent, '#app', null, [child])();
  //     const arg = spy.calls[0].arguments[0];
  //     expect(arg.props).toBe(props);
  //   });
  // });
});
