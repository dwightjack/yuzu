import { DetachedComponent } from 'yuzu';
import { Count } from './count';

export class Output extends DetachedComponent {
  public emitter: any;

  public state = {
    total: 0,
  };

  public async initialize() {
    this.emitter = setInterval(() => {
      this.emit('append', {});
    }, 1000);

    const det = await this.setRef({
      id: 'child',
      component: DetachedComponent,
    });

    const count = await det.setRef({
      component: Count,
      id: 'counter',
      el: document.createElement('p'),
    });

    this.on('change:total', (total) => {
      count.setState({ count: total });
    });
  }

  public beforeDestroy() {
    clearInterval(this.emitter);
  }
}
