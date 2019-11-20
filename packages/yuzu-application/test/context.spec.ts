import { createContext, IContext } from '../src/context';
import { Component } from 'yuzu';

describe('`Children`', () => {
  let ctx: IContext<{ demo?: boolean }>;
  let data: any;

  beforeEach(() => {
    data = { demo: true };
    ctx = createContext(data);
  });

  it('returns an object', () => {
    expect(ctx).toEqual(jasmine.any(Object));
  });

  it('expose a method to retrieve the internal data', () => {
    expect(ctx.getData()).toEqual(data);
  });

  it('exposes a method to overwrite current data', () => {
    const updated = { demo: false };
    ctx.update(updated);
    expect(ctx.getData()).toEqual(updated);
  });

  it('exposes a method to inject to the context into a component instance', () => {
    const component = new Component();
    const ret = ctx.inject(component);
    expect(ret).toBe(component as any);
    expect(component.$context).toEqual(data);
  });

  it('does NOT expose the context key as enumerable', () => {
    const component = new Component();
    ctx.inject(component);
    expect(Object.keys(component)).not.toContain('$context');
  });
});
