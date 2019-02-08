import { DetachedComponent } from 'yuzu';

export class Provider extends DetachedComponent {
  public static defaultOptions = () => ({
    selector: (v: any) => v,
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

  public subscribers = [];

  public getStore() {
    if (!this.$context) {
      throw new Error('Provider is not supplied with a $context');
    }
    return this.$context.$store;
  }

  public mapState(selector) {
    const $store = this.getStore();
    const update = (newState) => {
      this.setState(selector(newState));
    };

    this.subscribers.push($store.subscribe(update));

    return selector($store.state);
  }

  public mapActions(actions = {}) {
    const $store = this.getStore();
    return Provider.bindActions(actions, $store);
  }

  public toProps(selector, actions) {
    const state = this.mapState(selector);

    return {
      ...this.mapActions(actions),
      state,
    };
  }

  public beforeDestroy() {
    this.subscribers.forEach((unsubscribe) => unsubscribe());
    this.subscribers.length = 0;
  }

  public initialize() {
    const { selector } = this.options;
    if (typeof selector === 'function') {
      this.state = this.mapState(selector);
    }
  }
}
