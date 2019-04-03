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

  public async initialize(): Promise<void> {
    this.emitter = setInterval(() => {
      this.emit('append', { id: 'output' });
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

  public beforeDestroy(): void {
    clearInterval(this.emitter);
  }
}
