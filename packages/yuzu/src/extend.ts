import { Component } from './component';
import { IObject } from '../types';

type IComponentConstructor = typeof Component;
export interface IExtendedComponent<
  P extends Component = Component,
  M extends Record<string, any> = {}
> extends IComponentConstructor {
  new (options?: IObject): P & M;
}

/**
 * Utility method to create new Component classes in environments that don't support ES6 `class`es.
 *
 * @param {Component} parent Component class to extend
 * @param {object} props New component default properties and methods
 * @example
 * // UMD environment
 * const Text = YZ.extend(YZ.Component, {
 *  created: function () {
 *    this.state = { body:  '' };
 *  },
 *  mounted: function () {
 *    this.$el.innerHTML = this.state.body;
 *  }
 * });
 */
export function extend<P extends Component, E extends Record<string, any>>(
  parent: IComponentConstructor,
  props = {} as E,
): IExtendedComponent<P, E> {
  const child: IExtendedComponent<P, E> = props.hasOwnProperty('constructor')
    ? (props.constructor as any)
    : function ChildConstructor(this: Component, options?: IObject) {
        return parent.call(this, options);
      };

  // https://github.com/mridgway/hoist-non-react-statics/blob/master/index.js#L51
  const keys = Object.getOwnPropertyNames(parent);
  for (let i = 0, l = keys.length; i < l; i += 1) {
    const key = keys[i];
    const descriptor = Object.getOwnPropertyDescriptor(parent, key);
    try {
      // Avoid failures from read-only properties
      Object.defineProperty(child, key, descriptor as PropertyDescriptor);
    } catch (e) {}
  }

  child.prototype = Object.assign(Object.create(parent.prototype), props);
  child.prototype.constructor = child;

  (child as any).__super__ = parent.prototype;

  return child;
}
