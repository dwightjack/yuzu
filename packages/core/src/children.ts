import { qsa } from '@yuzu/utils';
import { Component } from './component';

export type childIterator<T = any> = (el: Element, index: number) => T;

/**
 * Element array Iterator.
 *
 * Accepts a CSS selector and an iterator function.
 *
 * Returns a function that accepts a parent component as first argument and iterates the iterator function over an array of DOM elements.
 *
 * DOM elements are selected from the CSS selector in the context of the passed-in parent's [`$el`](/packages/core/api/component#instance-properties) property.
 *
 * @param {string} selector Elements CSS selector
 * @param {function} fn Iterator function
 * @example
 * import { Children } from '@yuzu/core';
 *
 * const parent = new ParentComponent().mount('#list');
 * const iterator = (el, i) => new ChildComponent(el, { index: i });
 * const childComponentArray = Children('.items', iterator)(parent);
 */
export const Children = <T, I extends childIterator = childIterator<T>>(
  selector: string,
  fn: I,
) => (ctx: Component): Array<ReturnType<I>> => {
  const els = qsa(selector, ctx.$el as HTMLElement);
  return els.map(fn);
};
