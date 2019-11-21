import { Component, mount } from 'yuzu';
import { Output } from './output';
export { template } from './template';

interface IAppState {
  output: { id: string }[];
}

class App extends Component<IAppState> {
  public $els!: {
    contents: HTMLElement;
  };

  public selectors = {
    contents: '.contents',
  };

  public state: IAppState = {
    output: [],
  };

  public actions = {
    output: (v: IAppState['output']) => {
      this.$els.contents.innerText = JSON.stringify(v, null, 0);
    },
  };
}

export function initialize(root?: HTMLElement | null): () => Promise<void> {
  if (!root) {
    return () => Promise.resolve();
  }
  const app = mount(App, root, null, (app) => [
    mount(Output, null, {
      id: 'output',
      on: {
        append: (value: any) => {
          app.setState(({ output }) => ({
            output: [...output, value],
          }));
        },
      },
      state: {
        'output>total': (output: IAppState['output']) => output.length,
      },
    }),
  ])();

  return () => app.destroy();
}
