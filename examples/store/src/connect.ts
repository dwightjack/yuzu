import { Component } from 'yuzu';
import { IComponentConstructable, IObject, IState } from 'yuzu/types';

const bindActions = (actions, store) => {
  if (typeof actions === 'function') {
    return actions(store.dispatch);
  }
  const mapped = {};
  Object.keys(actions).forEach((i) => {
    mapped[i] = (...args) => store.dispatch(actions[i], ...args);
  });

  return mapped;
};

/* eslint-disable no-param-reassign */
export function attachStore(instance, selector?, actions?) {
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

  const update = (newState) => {
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

export function inject(instance, store) {
  Object.defineProperty(instance, '$context', {
    enumerable: false,
    writable: false,
    value: {
      $store: store,
    },
  });
  return instance;
}

export const connect = <C extends typeof Component>(selector?, actions?) => (
  Child: C,
) => {
  const Connected = class extends Child {
    constructor(options?) {
      super(options);

      Object.defineProperty(this, '$connected', {
        enumerable: false,
        writable: false,
        value: true,
      });
    }

    public initialize() {
      attachStore(this, selector, actions);
      super.initialize();
    }
  };

  const name = Child.root
    ? Child.root.replace(/^\./, '')
    : Child.name || 'Component';

  Object.defineProperty(Connected, 'displayName', {
    value: `Connected${name}`,
  });

  return Connected;
};
