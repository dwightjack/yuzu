import { DetachedComponent } from 'yuzu';
import { IObject, IState } from 'yuzu-yuzu/types';
import Store from './store';

export interface IProviderOptions {
  selector: <T>(v: T) => T;
}

export type dispatchFn = (...args: any[]) => any;

export type stateSelectorFn = (state: IState) => IObject;
export type IProviderActions = IObject | ((dispatch: dispatchFn) => IObject);

export class Provider extends DetachedComponent<{}, IProviderOptions> {
  public defaultOptions(): IProviderOptions {
    return {
      selector: (v) => v,
    };
  }

  public static bindActions(actions: IProviderActions, store: Store): IObject {
    if (typeof actions === 'function') {
      return actions(store.dispatch);
    }
    const mapped = {};
    Object.keys(actions).forEach((i) => {
      mapped[i] = (...args: any[]) => store.dispatch(actions[i], ...args);
    });

    return mapped;
  }

  public subscribers = [];

  public initialize(): void {
    const { selector } = this.options;
    if (typeof selector === 'function') {
      this.state = this.mapState(selector);
    }
  }

  public beforeDestroy(): void {
    this.subscribers.forEach((unsubscribe) => unsubscribe());
    this.subscribers.length = 0;
  }

  public getStore(): Store {
    if (!this.$context) {
      throw new Error('Provider is not supplied with a $context');
    }
    return this.$context.$store;
  }

  public mapState(selector: stateSelectorFn): ReturnType<stateSelectorFn> {
    const $store = this.getStore();
    const update = (newState: IState): void => {
      this.setState(selector(newState));
    };

    this.subscribers.push($store.subscribe(update));

    return selector($store.state);
  }

  public mapActions(actions = {}): IObject {
    const $store = this.getStore();
    return Provider.bindActions(actions, $store);
  }

  public toProps(
    selector: stateSelectorFn,
    actions: IProviderActions,
  ): IObject {
    const state = this.mapState(selector);

    return {
      ...this.mapActions(actions),
      state,
    };
  }
}
