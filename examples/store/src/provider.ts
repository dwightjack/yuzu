import { DetachedComponent, mount } from 'yuzu';

export class Provider extends DetachedComponent {
  public static defaultOptions = () => ({
    actions: {},
    selector: () => ({}),
    mount: () => {},
  });

  public static bindActions(actions, store) {
    if (typeof actions === 'function') {
      return actions(store.dispatch);
    }
    const mapped = {};
    Object.keys(actions).forEach((i) => {
      mapped[i] = (...args) => store.dispatch(actions[i], ...args);
    });

    return mapped;
  }

  public static bindState(selector, store) {
    if (!selector) {
      return {};
    }

    return (child, parent) => {
      const update = (newState) => {
        child.setState(selector(newState));
      };
      const unsubscribe = store.subscribe(update);

      parent.beforeDestroy = function beforeDestroy() {
        unsubscribe();
      };

      return selector(store.state);
    };
  }

  public initialize() {
    const { actions, selector, mount: mounter } = this.options;

    if (!this.$context) {
      throw new Error('Provider is not supplied with a $context');
    }
    const { $store } = this.$context;

    const state = Provider.bindState(selector, $store);
    mounter(mount, {
      state,
      ...Provider.bindActions(actions, $store),
    })(this);
  }
}

// new Provider({
//   selector: () => ({}),
//   mount: (h, props) => h(Navigation, '#nav', props),
// }).init();
