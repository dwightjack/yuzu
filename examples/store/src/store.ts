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
    this.logAction(`${action.name || ''}`, oldState, this.state, args);
  };

  public initialize() {
    this.actions = this.options.effects;
  }

  public ready() {
    this.logAction(`@@INIT`, this.state, null);
  }

  public logAction(msg, prev, next, args?) {
    if (process.env.NODE_ENV !== 'production') {
      if (this.options.debug === true) {
        /* tslint:disable no-console */
        const head = [
          `%c${this.options.name}: %c${msg}`,
          'color: gray; font-weight: lighter',
          'color: green; font-weight: bolder',
        ];
        if (args && args.length > 0) {
          head.push(args);
        }
        console.groupCollapsed(...head);

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
        /* tslint:enable no-console */
      }
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
