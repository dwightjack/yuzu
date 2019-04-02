import { Component, devtools, mount } from 'yuzu';
import { Output } from './output';
import { Count } from './count';

devtools(Component);

interface IAppState {
  output: any[];
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
    output(v: IAppState['output']) {
      this.$els.pre.innerText = JSON.stringify(v, null, 2);
    },
  };
}

mount(App, '#app', null, [
  mount(Output, null, {
    id: 'output',
    on: (app: App) => ({
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
