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
});
