import { mount, Component } from 'yuzu';
import { List } from './list';
import { Counter } from './counter';
import { createStore, Store } from 'redux';
export { template } from './template';

interface IStoreState {
  items: number[];
}

function reducer(state: IStoreState = { items: [] }, action: any): IStoreState {
  if (action.type === 'ADD') {
    return {
      ...state,
      items: [...state.items, state.items.length],
    };
  }
  return state;
}

export function fromStore(
  store: Store,
  selector?: (state: IStoreState) => any,
  actions?: (dispatch: Store['dispatch']) => Record<string, any>,
): any {
  const state = !selector
    ? {}
    : (instance: Component<any, any>) => {
        const update = (): void => {
          instance.setState(selector(store.getState()));
        };

        const unsubscribe = store.subscribe(update);

        const { beforeDestroy } = instance;

        instance.beforeDestroy = () => {
          unsubscribe();
          beforeDestroy.call(instance);
        };

        return selector(store.getState());
      };

  return {
    ...(actions && actions(store.dispatch)),
    state,
  };
}

export function initialize(root: HTMLElement): () => Promise<void> {
  if (!root) {
    return () => Promise.resolve();
  }

  const store = createStore(
    reducer,
    (window as any).__REDUX_DEVTOOLS_EXTENSION__ &&
      (window as any).__REDUX_DEVTOOLS_EXTENSION__(),
  );

  store.subscribe(() => {
    console.log(store.getState());
  });

  const listOptions = fromStore(
    store,
    ({ items }) => ({ items }),
    (dispatch) => ({
      onClick: () => dispatch({ type: 'ADD' }),
    }),
  );

  const counterOptions = fromStore(store, ({ items }) => ({
    count: items.length,
  }));

  const sandbox = mount(Component, '#app-connect', {}, [
    mount(List, '#list', listOptions),
    mount(Counter, '#num', counterOptions),
  ])();

  return () => sandbox.destroy();
}
