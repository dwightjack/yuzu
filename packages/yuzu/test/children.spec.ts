import { Component } from '../src/component';
import { Children } from '../src/children';
import * as utils from 'yuzu-utils';
import { mount } from 'yuzu-test-tools';

describe('`Children`', () => {
  let root: Component;
  const noop = (): void => undefined;

  beforeEach(() => {
    mount('component.html');
    root = new Component().mount('#ref');
  });

  it('should return a function', () => {
    expect(Children('.item', noop)).toEqual(jasmine.any(Function));
  });

  it('should query the selector in the `parentComponent.$el` context', () => {
    const selector = '.item';
    const iterator = Children(selector, noop);
    const spy = spyOn(utils, 'qsa').and.returnValue([]);

    iterator(root);

    expect(spy).toHaveBeenCalledWith(selector, root.$el);
  });

  it('should execute passed in selector function', () => {
    const els = [document.createElement('div')];
    const selector = jasmine.createSpy().and.returnValue(els);
    const iterator = Children(selector, (v) => v);
    iterator(root);
    expect(selector).toHaveBeenCalledWith(root.$el);
  });

  it('should use passed-in array of elements', () => {
    const els = [document.createElement('div')];
    const iterator = Children(els, (v) => v);
    expect(iterator(root)).toEqual(els);
  });

  it('should throw if an invalid selector is passed in', () => {
    const iterator = Children(null as any, (v) => v);
    expect(() => iterator(root)).toThrowError(TypeError);
  });

  it('should call a function on every matched element', () => {
    const selector = '.item';
    const spy = jasmine.createSpy();
    const iterator = Children(selector, spy);
    const els = (root.$el as HTMLElement).querySelectorAll(selector);
    iterator(root);

    expect(spy).toHaveBeenCalledTimes(els.length);

    for (let i = 0; i < els.length; i += 1) {
      const [el, idx] = spy.calls.argsFor(i);
      expect(el).toBe(els[i]);
      expect(idx).toBe(i);
    }
  });

  it('should return the iterator function result as an array', () => {
    const selector = '.item';
    const spy = jasmine.createSpy().and.returnValue(1);
    const iterator = Children(selector, spy);
    const results = iterator(root);

    expect(results).toEqual([1, 1]);
  });
});
