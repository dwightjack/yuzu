import { Component } from '../src/component';
import { DetachedComponent } from '../src/detached';

describe('`DetachedComponent`', () => {
  let inst: DetachedComponent;

  beforeEach(() => {
    inst = new DetachedComponent();
  });

  it('extends Component', () => {
    expect(inst).toEqual(jasmine.any(Component));
  });

  it('has a detached property', () => {
    expect(inst.detached).toBe(true);
  });

  it('throws if setting a component with root as child of a detached component', async () => {
    let e: any;
    try {
      await inst.setRef({
        id: 'withRoot',
        component: Component,
        el: document.createElement('div'),
      });
    } catch (err) {
      e = err;
    }
    expect(e).toEqual(jasmine.any(Error));
  });

  it('throws if setting a component with root as child of a detached components tree', async () => {
    const grandParent = new DetachedComponent().init();
    const parent = await grandParent.setRef({
      id: 'parent',
      component: DetachedComponent,
    });

    await parent.setRef({
      id: 'child',
      component: inst,
    });

    let e: any;
    try {
      await inst.setRef({
        id: 'withRoot',
        component: Component,
        el: document.createElement('div'),
      });
    } catch (err) {
      e = err;
    }
    expect(e).toEqual(jasmine.any(Error));
  });

  it('traverses the parent tree until it finds a plain element', async () => {
    const grandParent = new Component().mount(document.createElement('div'));
    const parent = await grandParent.setRef({
      component: DetachedComponent,
      id: 'parent',
    });

    await parent.setRef({
      id: 'child',
      component: inst,
    });

    let e: any;
    const el = document.createElement('div');
    try {
      await inst.setRef({
        id: 'withRoot',
        component: Component,
        el,
      });
    } catch (err) {
      e = err;
    }
    expect(e).toBe(undefined);
    expect(el.parentElement).toBe(grandParent.$el as HTMLElement);
  });
});
