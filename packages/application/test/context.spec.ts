import { createContext, IContext } from '../src/context';
import { Component } from 'yuzu';

describe('`Children`', () => {
  let ctx: IContext;
  let data: any;

  beforeEach(() => {
    data = {};
    ctx = createContext(data);
  });

  it('returns an object', () => {
    expect(ctx).toEqual(jasmine.any(Object));
  });

  it('expose a method to retrieve the internal data', () => {
    expect(ctx.getData()).toBe(data);
  });

  it('exposes a method to overwrite current data', () => {
    const updated = {};
    ctx.update(updated);
    expect(ctx.getData()).toBe(updated);
  });

  it('exposes a method to inject to the context into a component instance', () => {
    const component = new Component();
    const ret = ctx.inject(component);
    expect(ret).toBe(component);
    expect(component.$context).toBe(data);
  });

  it('does NOT expose the context key as enumerable', () => {
    const component = new Component();
    ctx.inject(component);
    expect(Object.keys(component)).not.toContain('$context');
  });
});
