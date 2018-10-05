import { mount as mountHTML } from '../../../shared/utils';
import { Component } from '../src/component';
import { devtools, YuzuRoot } from '../src/devtools';
import * as utils from 'yuzu-utils';

describe('`devtools`', () => {
  let el: HTMLElement;
  let inst: Component;
  let mount: any;

  class Child extends Component {}

  beforeAll(() => {
    mount = Component.prototype.mount;
    devtools(Component);
  });

  beforeEach(() => {
    el = document.createElement('div');
    inst = new Child().mount(el);
  });

  it('attaches a $yuzu property at mount', () => {
    expect((inst.$el as YuzuRoot).$yuzu).toBe(inst);
  });

  afterAll(() => {
    Component.prototype.mount = mount;
  });
});
