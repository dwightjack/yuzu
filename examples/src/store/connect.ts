import { Component } from 'yuzu';
import { createContext } from 'yuzu-application';
import Store from './store';
import { IComponentConstructable } from 'yuzu/types';

export type Actions = Record<string, (...args: any[]) => any>;
export type Selector<StoreState> = (state: StoreState) => Record<string, any>;
export type Connector<C> = (
  Child: IComponentConstructable<C>,
) => IComponentConstructable<C>;

const bindActions = (
  actions: Actions | ((dispatch: any) => Actions),
  store: Store<any>,
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

export function fromStore<StoreState = {}>(
  $store: Store<StoreState>,
  selector?: Selector<StoreState>,
  actions?:
    | Actions
    | ((dispatch: Store<StoreState>['dispatch']) => Actions)
    | null,
): any {
  const state = !selector
    ? {}
    : (instance: Component<any, any>) => {
        const update = (newState: any): void => {
          instance.setState(selector(newState));
        };

        const unsubscribe = $store.subscribe(update);

        const { beforeDestroy } = instance;

        instance.beforeDestroy = () => {
          unsubscribe();
          beforeDestroy.call(instance);
        };

        return selector($store.state);
      };

  return {
    ...(actions && bindActions(actions, $store)),
    state,
  };
}

/* eslint-disable no-param-reassign */
export function attachStore<StoreState = {}>(
  instance: Component,
  selector?: Selector<StoreState>,
  actions?:
    | Actions
    | ((dispatch: Store<StoreState>['dispatch']) => Actions)
    | null,
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

  const update = (newState: StoreState): void => {
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

export function inject<C, S>(
  instance: C,
  store: S,
): C & {
  $context: {
    $store: S;
  };
} {
  return createContext({ $store: store }).inject(instance);
}

export function connect<StoreState = {}>(
  selector?: Selector<StoreState>,
  actions?:
    | Actions
    | ((dispatch: Store<StoreState>['dispatch']) => Actions)
    | null,
): Connector<Component<any, any>> {
  return function connector(Child) {
    const Connected = class extends Child {
      public constructor(options?: any) {
        super(options);

        Object.defineProperty(this, '$connected', {
          value: true,
        });
      }

      public initialize(): void {
        attachStore<StoreState>(this, selector, actions);
        super.initialize();
      }
    };

    const name =
      Child.displayName ||
      (Child.root && Child.root.replace(/^\./, '')) ||
      Child.name ||
      'Component';

    return Object.defineProperty(Connected, 'displayName', {
      value: `Connected${name}`,
    });
  };
}
