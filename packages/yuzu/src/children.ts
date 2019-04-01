import { qsa } from 'yuzu-utils';
import { Component } from './component';

export type childIterator<T = any> = (el: Element, index: number) => T;
export type childSelector<E> = string | E[] | ((el: Element) => E[]);
export type childMounter<T> = (ctx: Component) => T[];
/**
 * Element array Iterator.
 *
 * The first argument can be:
 *
 * - a CSS selector. Element will be matched in the context of the passed-in parent's [`$el`](/packages/yuzu/api/component#instance-properties) property.
 * - an array of elements
 * - a function receiving the parent's root element and returning an array of element.
 *
 * The second parameter is an iterator function receiving the current element and its index as arguments.
 *
 * Returns a function that accepts a parent component as first argument and iterates the iterator function over an array of DOM elements.
 *
 * @param {string|Element[]} selector Elements CSS selector, array of elements or a function returning an array of elements.
 * @param {function} fn Iterator function
 * @example
 * import { Children } from 'yuzu';
 *
 * const parent = new ParentComponent().mount('#list');
 * const iterator = (el, i) => new ChildComponent(el, { index: i });
 *
 * const childComponentArray = Children('.items', iterator)(parent);
 *
 * // same as
 * // Children((el) => Array.from(el.querySelectorAll('.items')), iterator)(parent);
 *
 * // same as
 * // const els = Array.from(el.querySelectorAll('.items'))
 * // Children(els , iterator)(parent);
 */
export const Children = <
  T,
  E extends Element = Element,
  I extends childIterator = childIterator<T>
>(
  selector: childSelector<E>,
  fn: I,
): childMounter<ReturnType<I>> => (ctx) => {
  let els: E[];
  if (typeof selector === 'string') {
    els = qsa<E>(selector, ctx.$el);
  } else if (typeof selector === 'function') {
    els = selector(ctx.$el);
  } else if (Array.isArray(selector)) {
    els = selector;
  } else {
    throw new TypeError('Invalid selector argument');
  }
  return els.map(fn);
};
