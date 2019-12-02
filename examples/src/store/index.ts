import { mount, Component } from 'yuzu';
import { List } from './list';
import { Counter } from './counter';
import { createStore } from './store';
import { /*connect ,*/ fromStore } from './connect';
// import { Sandbox, createContext } from 'yuzu-application';
export { template } from './template';

interface IStoreState {
  items: number[];
}

const addItem = ({ items }: IStoreState): { items: number[] } => ({
  items: [...items, items.length],
});

// const ConnectedList = connect<IStoreState>(
//   ({ items }) => ({ items }),
//   (dispatch) => ({
//     onClick: () => dispatch(addItem),
//   }),
// )(List);

// const ConnectedCounter = connect<IStoreState>(
//   ({ items }) => ({ count: items.length }),
//   null,
// )(Counter);

export function initialize(root: HTMLElement): () => Promise<void> {
  if (!root) {
    return () => Promise.resolve();
  }

  const $store = createStore<IStoreState>({
    items: [],
  });

  const listOptions = fromStore(
    $store,
    ({ items }) => ({ items }),
    (dispatch) => ({
      onClick: () => dispatch(addItem),
    }),
  );

  const counterOptions = fromStore($store, ({ items }) => ({
    count: items.length,
  }));

  // const sandbox = mount(Sandbox, '#app-connect', {
  //   context: createContext({ $store }),
  //   components: [
  //     [ConnectedList, { selector: '#list' }],
  //     [ConnectedCounter, { selector: '#num' }],
  //   ],
  // })();

  const sandbox = mount(Component, '#app-connect', {}, [
    mount(List, '#list', listOptions),
    mount(Counter, '#num', counterOptions),
  ])();

  return () => sandbox.destroy();
}
