import { Component, devtools } from 'yuzu';
import { Sandbox } from 'yuzu-application';
import { List } from './list';
import { Counter } from './counter';
import { Provider } from './provider';
import { createStore } from './store';
import { connect } from './connect';
import { Count } from 'detached/src/count';

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
  root: '#app-connect',
  components: [
    [ConnectedList, { selector: '#list' }],
    [ConnectedCounter, { selector: '#num' }],
  ],
});

sandbox.start({ $store });

const sandboxProdiver = new Sandbox({
  root: '#app-provider',
  components: [
    Provider((mapState, mapActions, provider) => {
      const state = mapState(({ items }) => ({ items }));
      const options = mapActions((dispatch) => ({
        onClick: () => dispatch(addItem),
      }));

      provider.setRef(
        {
          component: List,
          el: '#list',
          id: 'list',
          ...options,
        },
        state,
      );
    }),
    Provider((mapState, _, provider) => {
      const state = mapState(({ items }) => ({ count: items.length }));

      provider.setRef(
        {
          component: Count,
          el: '#num',
          id: 'num',
        },
        state,
      );
    }),
  ],
});

sandbox.start({ $store });
