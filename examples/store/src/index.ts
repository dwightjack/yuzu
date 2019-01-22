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

const setTotal = ({ items }) => ({
  total: items.length,
});

const ConnectedList = connect(
  ({ items }) => ({ items }),
  (dispatch) => ({
    onClick: () => {
      dispatch((state) => {
        const { items } = addItem(state);

        return {
          items,
          ...setTotal({ ...state, items }),
        };
      });
    },
  }),
)(List);

const ConnectedCounter = connect(
  ({ total }) => ({ count: total }),
  null,
)(Counter);

const $store = createStore({
  items: [],
  total: 0,
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
