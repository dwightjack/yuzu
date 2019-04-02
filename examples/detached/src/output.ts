import { DetachedComponent } from 'yuzu';
import { Count } from './count';

interface IOutputState {
  total: number;
}
export class Output extends DetachedComponent<IOutputState> {
  public emitter: any;

  public state = {
    total: 0,
  };

  public async initialize() {
    this.emitter = setInterval(() => {
      this.emit('append', {});
    }, 1000);

    const det = await this.setRef<DetachedComponent>({
      id: 'child',
      component: DetachedComponent as any,
    });

    const count: Count = await det.setRef({
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
