import { Component, mount } from '@packages/yuzu/src';
import { createContext } from '@packages/application/src';
import { List } from './list';
import { Counter } from './counter';
import { connect } from './connect';
import { actions, reducer } from './store';
declare const Redux: any;

const ConnectedList = connect(
  ({ items }) => ({ items }),
  (dispatch) => ({
    onClick: () => dispatch(actions.addItem()),
  }),
)(List);

const ConnectedCounter = connect(
  ({ items }) => ({ count: items.length }),
  null,
)(Counter);

const $store = Redux.createStore(reducer);

const context = createContext({ $store });

class App extends Component {
  public initialize() {
    mount(ConnectedList, '#list')(this);
    mount(ConnectedCounter, '#num')(this);
  }
}

context.inject(new App()).mount('#app');
