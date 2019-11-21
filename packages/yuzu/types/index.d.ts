export interface IState {
  [key: string]: any;
}

export interface IListener {
  event: string;
  element: Element;
}

export interface IComponentConstructable<C> {
  new (options?: any): C;
  root?: string;
  YUZU_DATA_ATTR: string;
  YUZU_COMPONENT: boolean;
  displayName?: string;
}

export interface IRef<T> {
  id: string;
  el?: Element | HTMLElement | string;
  component: T;
  on?: Record<string, fn>;
  [key: string]: any;
}

export interface IStateLogger<T, S> {
  label: string;
  subscribe: (instance: T, event: string) => () => void;
  unsubscribe: (instance: T, event: string) => void;
  unsubscribeAll: (instance: T) => void;
  log: (msg: string, next: S, prev?: S, args?: any[]) => void;
}

export type fn = (...args: any[]) => any;
export type eventHandlerFn = (e: Event, ...args: any[]) => void;
export type setRefProps<C, P> = IState | ((ref: C, parent: P) => void | IState);
