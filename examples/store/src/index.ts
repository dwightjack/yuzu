import { Component, mount } from '@packages/yuzu/src';
import { createContext } from '@packages/application/src';
import { List } from './list';
import { Counter } from './counter';
import { createStore } from './store';
import { connect } from './connect';

const addItem = ({ items }) => ({
  items: [...items, items.length],
});

const ConnectedList = connect(
  ({ items }) => ({ items }),
  (dispatch) => ({
    onClick: () => dispatch(addItem),
  }),
)(List);

const ConnectedCounter = connect(
  ({ items }) => ({ count: items.length }),
  null,
)(Counter);

const $store = createStore({
  items: [],
});

const context = createContext({ $store });

class App extends Component {
  public initialize() {
    this.setRef({
      id: 'list',
      component: ConnectedList,
      el: this.$el.querySelector('#list'),
    });

    this.setRef({
      id: 'num',
      component: ConnectedCounter,
      el: this.$el.querySelector('#num'),
    });
  }
}

context.inject(new App()).mount('#app');
