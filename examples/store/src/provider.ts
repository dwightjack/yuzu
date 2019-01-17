import { DetachedComponent } from 'yuzu';

let idx = -1;

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

export const Provider = (fn) => {
  return class StoreProvider extends DetachedComponent {
    public static attachTo(parent) {
      idx += 1;
      return parent.setRef({
        component: this,
        id: `provider_${idx}`,
      });
    }

    public subscribers: any[];

    public created() {
      this.subscribers = [];
    }

    public initialize() {
      const { mapState, mapActions } = this.createMaps();
      fn(mapState, mapActions, this);
    }

    public beforeDestroy() {
      this.subscribers.forEach((unsubscribe) => {
        unsubscribe();
      });
      this.subscribers = [];
    }

    public createMaps() {
      const mapState = (selector) => (ref) => {
        const { $store } = this.$context;

        const update = (newState) => {
          ref.setState(selector(newState));
        };

        update($store.state);
        this.subscribers.push($store.subscribe(update));
      };

      const mapActions = (actions) => {
        const { $store } = this.$context;
        return bindActions(actions, $store);
      };

      return {
        mapState,
        mapActions,
      };
    }
  };
};
