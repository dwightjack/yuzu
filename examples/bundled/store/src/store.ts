import { DetachedComponent } from 'yuzu';

export default class Store extends DetachedComponent {
  static defaultOptions = () => ({ name: 'default', debug: true, effects: {} });

  dispatch = async (action, ...args) => {
    const { state: oldState } = this;
    const state = await action(this.state, ...args);
    if (state) {
      this.setState(state);
    }
    this.logAction(`${action.name || ''}`, oldState, this.state);
  };

  initialize() {
    this.actions = this.options.effects;
  }

  ready() {
    this.logAction(`@@INIT`, this.state);
  }

  logAction(msg, prev, next) {
    if (__DEV__) {
      if (this.options.debug === true) {
        /* eslint-disable no-console */
        console.groupCollapsed(
          `%c${this.options.name}: %c${msg}`,
          'color: gray; font-weight: lighter',
          'color: green; font-weight: bolder',
        );

        if (next) {
          console.log('%cprev state', 'color: gray; font-weight: bolder', prev);
          console.log(
            '%cnext state',
            'color: green; font-weight: bolder',
            next,
          );
        } else {
          console.log(
            '%cinitial state',
            'color: gray; font-weight: bolder',
            prev,
          );
        }
        console.groupEnd();
        /* eslint-enable no-console */
      }
    }
  }

  subscribe(fn) {
    const listener = (state) => fn(state);
    this.on('change:*', listener);
    return () => this.unsubscribe(listener);
  }

  unsubscribe(fn) {
    this.off('change:*', fn);
  }
}

export const createStore = (initialState, options) =>
  new Store(options).init(initialState);
