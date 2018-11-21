import { Component, devtools, mount } from '@packages/yuzu/src';
import { Form } from './form';

devtools(Component);

class App extends Component {
  public $els: Component['$els'] & {
    list: Element;
    form: Element;
  };

  public selectors = {
    list: '#list',
    form: '#form',
  };

  public state = {
    todos: [],
  };

  public actions = {
    todos: 'renderList',
  };

  public renderList() {
    this.$els.list.textContent = '';
    const docFrag = document.createDocumentFragment();

    this.state.todos.forEach((text) => {
      const li = document.createElement('li');
      li.textContent = text;
      docFrag.appendChild(li);
    });
    this.$els.list.appendChild(docFrag);
  }

  public initialize() {
    this.setRef({
      el: this.$els.form,
      component: Form,
      id: 'form',
      on: {
        submit: (v) => {
          this.setState(({ todos }) => ({ todos: [...todos, v] }));
        },
      },
    });
  }
}

new App().mount('#app');
