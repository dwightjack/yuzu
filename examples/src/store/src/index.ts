import { Component, devtools, mount } from 'yuzu';
import { Sandbox, createContext } from 'yuzu-application';
import { List } from './list';
import { Counter } from './counter';
import { Provider } from './provider';
import { createStore } from './store';
import { connect } from './connect';
import { Count } from 'detached/src/count';

devtools(Component);

const addItem = ({ items }): { items: string[] } => ({
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

mount(Component, '#app-provider', {}, (component) => {
  createContext({ $store }).inject(component);

  return [
    mount(Provider, null, {}, (provider: Provider) => {
      const options = provider.mapActions((dispatch) => ({
        onClick: () => dispatch(addItem),
      }));

      return [
        mount(List, '#list-provider', {
          ...options,
          state: {
            'items>items': (items) => items,
          },
        }),
        mount(Count, '#num-provider', {
          state: {
            'items>count': (items) => items.length,
          },
        }),
      ];
    }),
  ];
})();
