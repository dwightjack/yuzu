import { Component } from '../src/component';
import { extend } from '../src/extend';
describe('`extend`', () => {
  it('should return a Component constructor', () => {
    const MyComp = extend(Component);
    const inst = new MyComp();
    expect(inst).toEqual(jasmine.any(Component));
    expect(inst).toEqual(jasmine.any(MyComp));
  });

  it("should set the a Component's `prototype.constructor` as the constructor", () => {
    const MyComp = extend(Component);
    expect(MyComp.prototype.constructor).toBe(MyComp);
  });

  it('should set a `__super__` property pointing to the parent prototype', () => {
    const MyComp = extend(Component);
    expect((MyComp as any).__super__).toBe(Component.prototype);
  });

  it('should call the parent constructor with passed-in arguments', () => {
    const spy = jasmine.createSpy();
    class Parent extends Component {
      constructor(...args: any[]) {
        super(...args);
        spy(...args);
      }
    }
    const MyComp = extend(Parent);
    const options = { demo: true };
    const inst = new MyComp(options);

    expect(spy).toHaveBeenCalledWith(options);
  });

  it('should call the parent constructor with the child context', () => {
    const spy = jasmine.createSpy();
    class Parent extends Component {
      //tslint:disable-line
      constructor(...args: any[]) {
        super(...args);
        spy(this);
      }
    }
    const MyComp = extend(Parent);
    const inst = new MyComp();
    expect(spy).toHaveBeenCalledWith(inst);
  });

  it('should allow to define a custom constructor function', () => {
    const spy = jasmine.createSpy();
    const MyComp = extend(Component, {
      constructor: spy,
    });
    const options = {};
    const inst = new MyComp(options);
    expect(spy).toHaveBeenCalledWith(options);
  });

  it('should copy static properties and methods', () => {
    const MyComp = extend(Component);
    expect(MyComp.YUZU_COMPONENT).toBe(Component.YUZU_COMPONENT);
  });

  it('should accept custom prototype methods', () => {
    const MyComp = extend(Component, {
      aMethod() {
        return this;
      },
    });

    const inst = new MyComp();

    expect(inst.aMethod).toEqual(jasmine.any(Function));
    expect(inst.aMethod()).toBe(inst);
  });
});
