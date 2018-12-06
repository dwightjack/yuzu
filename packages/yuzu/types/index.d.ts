export interface IObject<T = any> {
  [key: string]: T;
}

export interface IState {
  [key: string]: any;
}

export interface IListener {
  event: string;
  element: Element;
}

export interface IRefConstructor<T> {
  id: string;
  el?: Element | HTMLElement | string;
  component: T;
  on?: IObject<fn>;
  [key: string]: any;
}

export interface IAbstractRefConstructor<T> {
  id: string;
  component: T;
  on?: IObject<fn>;
  [key: string]: any;
}

export interface IRefInstance<T> {
  id: string;
  component: T;
  on?: IObject<fn>;
  [key: string]: any;
}

export interface IRefFactory<T> {
  id: string;
  el?: Element | HTMLElement | string;
  component: (el: Element, state: IState) => T;
  on?: IObject<fn>;
  [key: string]: any;
}

export interface IAbstractRefFactory<T> {
  id: string;
  component: (el: Element, state: IState) => T;
  on?: IObject<fn>;
  [key: string]: any;
}

export interface IStateLogger<T> {
  label: string;
  subscribe: (instance: T, event: string) => (() => void);
  unsubscribe: (instance: T, event: string) => void;
  unsubscribeAll: (instance: T) => void;
  log: (msg: string, next: IState, prev: IState, args?: any[]) => void;
}

export type fn = (...args: any[]) => any;
export type eventHandlerFn = (e: Event, ...args: any[]) => void;
export type stateUpdaterFn<T = IState> = (state: T) => Partial<T>;
export type ReadyStateFn = (current: IState, prev: IState) => boolean;
