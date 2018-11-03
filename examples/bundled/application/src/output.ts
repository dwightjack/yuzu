import { DetachedComponent } from '../../../../packages/yuzu/src';

export class Output extends DetachedComponent {
  public emitter: any;

  public initialize() {
    this.emitter = setInterval(() => {
      this.emit('append', {});
    }, 1000);

    this.setRef({
      id: 'child',
      component: DetachedComponent,
    });
  }

  public beforeDestroy() {
    clearInterval(this.emitter);
  }
}
