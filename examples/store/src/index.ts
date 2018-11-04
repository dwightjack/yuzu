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
    mount(ConnectedList, '#list')(this);
    mount(ConnectedCounter, '#num')(this);
  }
}

context.inject(new App()).mount('#app');
