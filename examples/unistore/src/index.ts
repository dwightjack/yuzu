import { Component, mount, devtools } from 'yuzu';
import { createContext } from 'yuzu-application';
import { List } from '../../store/src/list';
import { Counter } from '../../store/src/counter';
import { connect } from './connect';

declare const unistore: any;

devtools(Component);

const addItem = ({ items }) => ({
  items: [...items, items.length],
});

const ConnectedList = connect(
  ({ items }) => ({ items }),
  {
    onClick: addItem,
  },
)(List);

const ConnectedCounter = connect(
  ({ items }) => ({ count: items.length }),
  null,
)(Counter);

const $store = unistore({
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
