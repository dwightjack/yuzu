import { Component, devtools, mount } from 'yuzu';
import { Output } from './output';
import { Count } from './count';

devtools(Component);

class App extends Component {
  public selectors = {
    pre: 'pre',
  };

  public state = {
    output: [],
  };

  public actions = {
    output(v) {
      this.$els.pre.innerText = JSON.stringify(v, null, 2);
    },
  };

  // public initialize() {
  //   this.setRef({
  //     id: 'output',
  //     component: Output,
  //     on: {
  //       append: (value) => {
  //         this.setState(({ output }) => ({
  //           output: [...output, value],
  //         }));
  //       },
  //     },
  //   });
  // }
}

mount(App, '#app', null, [
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
      'output>total': (output) => output.length,
    },
  }),
])();

// new App().mount('#app');
