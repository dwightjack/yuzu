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
    await expectAsync(
      inst.setRef({
        id: 'withRoot',
        component: Component,
        el: document.createElement('div'),
      }),
    ).toBeRejected();
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

    await expectAsync(
      inst.setRef({
        id: 'withRoot',
        component: Component,
        el: document.createElement('div'),
      }),
    ).toBeRejected();
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

    const el = document.createElement('div');
    const promise = inst.setRef({
      id: 'withRoot',
      component: Component,
      el,
    });

    await expectAsync(promise).not.toBeRejected();
    expect(el.parentElement).toBe(grandParent.$el as HTMLElement);
  });
});
