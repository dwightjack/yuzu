import { DetachedComponent } from '@packages/yuzu/src';

export default class Store extends DetachedComponent {
  public static defaultOptions = () => ({
    name: 'default',
    debug: true,
    effects: {},
  });

  public dispatch = async (action, ...args) => {
    const { state: oldState } = this;
    const state = await action(this.state, ...args);
    if (state) {
      this.setState(state);
    }
    this.logAction(`${action.name || ''}`, this.state, oldState, args);
  };

  public initialize() {
    if (this.options.debug && this.$$logStart) {
      this.$$logStart(this.options.name, 'change:*', false);
    }
    this.actions = this.options.effects;
  }

  public ready() {
    this.logAction(`@@INIT`, this.state, null);
  }

  public logAction(msg, prev, next, args?) {
    if (this.options.debug && this.$$logger) {
      this.$$logger.log(msg, prev, next, args);
    }
  }

  public subscribe(fn) {
    const listener = (state) => fn(state);
    this.on('change:*', listener);
    return () => this.unsubscribe(listener);
  }

  public unsubscribe(fn) {
    this.off('change:*', fn);
  }
}

export const createStore = (initialState, options?) =>
  new Store(options).init(initialState);
