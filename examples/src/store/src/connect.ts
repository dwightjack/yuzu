import { Component } from 'yuzu';
import Store from './store';
import { IComponentConstructable, IState, IObject } from 'yuzu/types';

export type Actions = IObject<(...args: any[]) => any>;
export type Selector = (state: IState) => IState;
export type Connector<C extends Component> = (
  Child: IComponentConstructable<C>,
) => IComponentConstructable<C>;

const bindActions = (
  actions: Actions | ((dispatch: any) => Actions),
  store: Store,
): Actions => {
  if (typeof actions === 'function') {
    return actions(store.dispatch);
  }
  const mapped: Actions = {};
  Object.keys(actions).forEach((i) => {
    mapped[i] = (...args: any[]) => store.dispatch(actions[i], ...args);
  });

  return mapped;
};

/* eslint-disable no-param-reassign */
export function attachStore(
  instance: Component,
  selector?: Selector,
  actions?: Actions | ((dispatch: any) => Actions),
): void {
  if (!instance.$context) {
    return;
  }
  const { $store } = instance.$context;

  if (actions) {
    Object.assign(instance.options, bindActions(actions, $store));
  }

  if (!selector) {
    return;
  }

  const state = selector($store.state);
  Object.assign(instance.state, state);

  const update = (newState: IState): void => {
    instance.setState(selector(newState));
  };

  const unsubscribe = $store.subscribe(update);

  const { beforeDestroy } = instance;

  instance.beforeDestroy = () => {
    unsubscribe();
    beforeDestroy.call(instance);
  };
}
/* eslint-enable no-param-reassign */

export function inject<C extends Component>(instance: C, store: Store): C {
  Object.defineProperty(instance, '$context', {
    enumerable: false,
    writable: false,
    value: {
      $store: store,
    },
  });
  return instance;
}

export function connect(
  selector?: Selector,
  actions?: Actions | ((dispatch: any) => Actions),
): Connector<Component> {
  return function connector(Child) {
    const Connected = class extends Child {
      public constructor(options?: any) {
        super(options);

        Object.defineProperty(this, '$connected', {
          value: true,
        });
      }

      public initialize(): void {
        attachStore(this, selector, actions);
        super.initialize();
      }
    };

    const name =
      Child.displayName ||
      (Child.root && Child.root.replace(/^\./, '')) ||
      Child.name ||
      'Component';

    Object.defineProperty(Connected, 'displayName', {
      value: `Connected${name}`,
    });

    return Connected;
  };
}
