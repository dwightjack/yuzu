import { Component, mount, devtools } from 'yuzu';
import { createContext } from 'yuzu-application';
import { List } from '../../store/src/list';
import { Counter } from '../../store/src/counter';
import { connect } from './connect';
import { actions, reducer } from './store';
declare const Redux: any;

devtools(Component);

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
