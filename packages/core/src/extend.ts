import { Component } from './component';

export const extend = (
  parent: typeof Component,
  props: { [key: string]: any } = {},
) => {
  const child = props.hasOwnProperty('constructor')
    ? props.constructor
    : function ChildConstructor(...args: any[]) {
        return parent.apply(parent, ...args);
      };

  // https://github.com/mridgway/hoist-non-react-statics/blob/master/index.js#L51
  const keys = Object.getOwnPropertyNames(parent);
  for (const key of keys) {
    const descriptor = Object.getOwnPropertyDescriptor(parent, key);
    try {
      // Avoid failures from read-only properties
      Object.defineProperty(child, key, descriptor as PropertyDescriptor);
    } catch (e) {} // tslint:disable-line no-empty
  }

  child.prototype = Object.assign(Object.create(parent.prototype), props);
  child.prototype.constructor = child;

  (child as any).__super__ = parent.prototype;

  return child;
};
