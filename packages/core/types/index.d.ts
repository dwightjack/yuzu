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
  el: Element | HTMLElement | string;
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
  el: Element | HTMLElement | string;
  component: (el: Element) => T;
  on?: IObject<fn>;
  [key: string]: any;
}

export type fn = (...args: any[]) => any;
export type eventHandlerFn = (e: Event, ...args: any[]) => void;
export type stateUpdaterFn<T = IState> = (state: T) => Partial<T>;
