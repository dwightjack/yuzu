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
    let idx = 0;
    this.emitter = setInterval(() => {
      idx += 1;
      this.emit('append', { id: `output n.${idx}` });
    }, 1000);

    const det = await this.setRef({
      id: 'child',
      component: DetachedComponent,
    });

    const countRoot = document.createElement('p');
    countRoot.className = 'badge badge-secondary';

    const count = await det.setRef({
      component: Count,
      id: 'counter',
      el: countRoot,
    });

    this.on('change:total', (total) => {
      count.setState({ count: total });
    });
  }

  public beforeDestroy(): void {
    clearInterval(this.emitter);
  }
}
