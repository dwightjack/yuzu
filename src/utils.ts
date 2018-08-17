import { fn, IObject } from '../types/yuzu';
/**
 * uid prefix
 *
 * @public
 * @type {string}
 */
export const UID_PREFIX: string = '_ui.';

/**
 * @private
 */
let uid: number = -1;

/**
 * Void function
 */
export const noop = (): void => {}; // tslint:disable-line no-empty

/**
 * Returns a sequential uid
 */
export const nextUid = (prefix: string = UID_PREFIX): string => prefix + ++uid;

const funcToString = Function.prototype.toString;
const objProto = Object.prototype;
const objToString = objProto.toString;
const hasOwnProperty = objProto.hasOwnProperty;
const objectCtorString = funcToString.call(Object);

/**
 * Checks if a passed-in value has a `typeof` of `object`
 */
export const isObjectLike = (value: any): boolean =>
  !!value && typeof value === 'object';

/**
 * Checks if a value is a plain object (aka: _POJO_)
 */
export const isPlainObject = (value: any): value is IObject => {
  if (!isObjectLike(value) || objToString.call(value) !== '[object Object]') {
    return false;
  }
  const proto = Object.getPrototypeOf(value);
  if (proto === null) {
    return true;
  }
  const Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
  return (
    typeof Ctor === 'function' &&
    Ctor instanceof Ctor &&
    funcToString.call(Ctor) === objectCtorString
  );
};

/**
 * Checks if a value is a DOM element
 */
export const isElement = (value: any): value is Element =>
  !!value &&
  value.nodeType === 1 &&
  isObjectLike(value) &&
  !isPlainObject(value);

/**
 * If `value` is a function executes it with passed-in arguments and returns its result,
 * otherwise returns `value`
 * @param {any} value
 * @param {...args} args Optional arguments
 * @return {*}
 */
export const evaluate = <T = any>(
  value: T,
  ...args: any[]
): T extends fn ? ReturnType<T> : T => {
  return typeof value === 'function' ? value(...args) : value;
};

export const bindMethod = (ctx: any, method: string | fn): fn => {
  if (typeof method === 'string' && typeof ctx[method] === 'function') {
    return (...args: any[]) => ctx[method](...args);
  }
  return (method as fn).bind(ctx);
};

export const INLINE_STATE_REGEXP = /^ui([A-Z].+)$/;

/**
 * Parses an element's `dataset` with optional filtering
 *
 * @param {RegExp} [matcher] Optional matcher to filter dataset by key
 * @returns {object}
 */

export const datasetParser = (
  el: HTMLElement,
  matcher = INLINE_STATE_REGEXP,
) => {
  return Object.entries(el.dataset).reduce((acc: IObject, [key, value]) => {
    if (matcher.test(key)) {
      const newKey = key.replace(
        matcher,
        (_, m) => `${m[0].toLowerCase()}${m.slice(1)}`,
      );
      acc[newKey] = value;
    }
    return acc;
  }, {});
};

/**
 * Returns the first element within the document that matches the specified group of selectors
 *
 * #### Example:
 *
 * ```
 * const content = qs('#main-content');
 * ```
 *
 * @name qs
 * @function
 * @param {string} selector - CSS selector
 * @param {Element|Document} [ctx=document] - Root element. `document` by default
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector
 * @return {Element|null}
 */
export const qs = (
  selector: string,
  ctx: Document | Element = document,
): Element | null => ctx.querySelector(selector);

/**
 * Returns a list of the elements within the document that match the specified group of selectors
 *
 * #### Example:
 *
 * ```
 * const listItems = qsa('.list .list-items');
 * ```
 *
 * @name qsa
 * @function
 * @param {string} selector - One or more CSS selectors separated by commas.
 * @param {Element|Document} [ctx=document] - Root element. `document` by default
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelectorAll
 * @return {Array}
 */
export const qsa = (
  selector: string,
  ctx: Element | Document = document,
): HTMLElement[] => Array.from(ctx.querySelectorAll(selector));
