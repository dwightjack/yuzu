import { Component } from 'yuzu-yuzu/src';

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

export interface IComponentConstructable<C> {
  new (options: IObject): C;
  root?: string;
  isComponent: (value: any) => value is IComponentConstructable<C>;
  UID_DATA_ATTR: string;
  YUZU_COMPONENT: boolean;
  defaultOptions: (self?: any) => IObject;
}

export interface IRef<T> {
  id: string;
  el?: T extends Component ? never : Element | HTMLElement | string;
  component: T;
  on?: IObject<fn>;
  [key: string]: any;
}

export interface IStateLogger<T> {
  label: string;
  subscribe: (instance: T, event: string) => () => void;
  unsubscribe: (instance: T, event: string) => void;
  unsubscribeAll: (instance: T) => void;
  log: (msg: string, next: IState, prev: IState, args?: any[]) => void;
}

export type fn = (...args: any[]) => any;
export type eventHandlerFn = (e: Event, ...args: any[]) => void;
export type stateUpdaterFn<T> = (state: T) => Partial<T>;
export type ReadyStateFn<S> = (current: S, prev: S) => boolean;
export type setRefProps<C, P> = IState | ((ref: C, parent: P) => void | IState);
