import { Component, devtools, mount, DetachedComponent } from 'yuzu';
import { Sandbox, createContext } from 'yuzu-application';
import { List } from './list';
import { Counter } from './counter';
import { Provider } from './provider';
import { createStore } from './store';
import { connect } from './connect';
import { Count } from 'detached/src/count';
import { isContext } from 'vm';

// devtools(Component);

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

mount(DetachedComponent, null, {}, [
  mount(Provider, null, {
    selector: ({ items }) => ({ items }),
    actions: (dispatch) => ({
      onClick: () => dispatch(addItem),
    }),
    mount: (h, props) => h(List, '#list-provider', props),
  }),
  mount(Provider, null, {
    selector: ({ items }) => ({ count: items.length }),
    mount: (h, props) => h(Count, '#num-provider', props),
  }),
])(createContext({ $store }).inject(new Component().mount('#app-provider')));
