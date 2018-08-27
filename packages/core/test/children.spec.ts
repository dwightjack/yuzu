import { Component } from '../src/component';
import { Children } from '../src/children';
import * as utils from '@yuzu/utils';
import { mount } from '../../../shared/utils';

describe('`Children`', () => {
  let root: Component;
  const noop = () => {}; // tslint:disable-line no-empty

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

  it('should call a function on every matched element', () => {
    const selector = '.item';
    const spy = jasmine.createSpy();
    const iterator = Children(selector, spy);
    const els = (root.$el as HTMLElement).querySelectorAll(selector);
    iterator(root);

    expect(spy).toHaveBeenCalledTimes(els.length);

    for (let i = 0; i < els.length; i += 1) {
      let el: Node;
      let idx: number;
      [el, idx] = spy.calls.argsFor(i);
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
