import { Component, devtools, mount } from '../../../packages/yuzu/src';
import { Output } from './output';

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
  }),
])();

// new App().mount('#app');
