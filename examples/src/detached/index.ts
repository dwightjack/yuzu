import { Component, mount } from 'yuzu';
import { Output } from './output';
export  {template} from './template'

interface IAppState {
  output: { id: string }[];
}

class App extends Component<IAppState> {
  public $els!: {
    pre: HTMLPreElement;
  };

  public selectors = {
    pre: 'pre',
  };

  public state = {
    output: [],
  };

  public actions = {
    output: (v: IAppState['output']) => {
      this.$els.pre.innerText = JSON.stringify(v, null, 2);
    },
  };
}

export function initialize(root?: HTMLElement | null) {
  if (!root) {
    return
  }
  const app = mount(App, root, null, [
    mount(Output, null, {
      id: 'output',
      on: (app) => ({
        append: (value) => {
          app.setState(({ output }) => ({
            output: [...output, value],
          }));
        },
      }),
      state: {
        'output>total': (output: IAppState['output']) => output.length,
      },
    }),
  ])();

  return () => app.destroy()
}
