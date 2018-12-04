import { Component, mount, devtools } from 'yuzu';
import { createContext, Sandbox } from 'yuzu-application';
import { List } from './list';
import { Counter } from './counter';
import { createStore } from './store';
import { connect } from './connect';

devtools(Component);

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

// const context = createContext({ $store });

const sandbox = new Sandbox({
  root: '#app',
  components: [
    [ConnectedList, { selector: '#list' }],
    [ConnectedCounter, { selector: '#num' }],
  ],
});

sandbox.start({ $store });

(window as any).store = $store;
