import { Component } from './component';
import { IObject } from '../types';

type IComponentConstructor = typeof Component;
export interface IExtendedComponent<P extends Component, M>
  extends IComponentConstructor {
  new (options?: IObject): P & M;
}

export const extend = <P extends Component, T extends IObject>(
  parent: IComponentConstructor,
  props: T = {} as T,
): IExtendedComponent<P, T> => {
  const child = props.hasOwnProperty('constructor')
    ? props.constructor
    : function ChildConstructor(this: Component): P {
        return parent.apply(this, arguments);
      };

  // https://github.com/mridgway/hoist-non-react-statics/blob/master/index.js#L51
  const keys = Object.getOwnPropertyNames(parent);
  for (let i = 0, l = keys.length; i < l; i += 1) {
    const key = keys[i];
    const descriptor = Object.getOwnPropertyDescriptor(parent, key);
    try {
      // Avoid failures from read-only properties
      Object.defineProperty(child, key, descriptor as PropertyDescriptor);
    } catch (e) {} // tslint:disable-line no-empty
  }

  child.prototype = Object.assign(Object.create(parent.prototype), props);
  child.prototype.constructor = child;

  (child as any).__super__ = parent.prototype;

  return child as IExtendedComponent<P, T>;
};
