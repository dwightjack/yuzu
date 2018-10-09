import { fn, IObject } from 'yuzu/types';
import dush, { Idush } from 'dush';

/**
 * !> This module is intended for usage inside the _yuzu*_ modules ecosystem and not for end-user applications.
 *
 * @name yuzu/utils
 */

/**
 * uid prefix.
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
 * Void function.
 *
 * @example
 * @type {function}
 * @example
 * import { noop } from 'yuzu-utils';
 *
 * noop() === undefined
 */
export const noop = (): void => {}; // tslint:disable-line no-empty

/**
 * Returns a sequential uid with optional prefix.
 *
 * @param {string} [prefix=UID_PREFIX] uid prefix. Defaults to the value of `UID_PREFIX`
 * @returns {string}
 * @example
 * import { nextUid } from 'yuzu-utils';
 *
 * nextUid() === '_ui.0'
 * nextUid() === '_ui.1'
 * nextUid('custom.') === 'custom.2'
 */
export const nextUid = (prefix: string = UID_PREFIX): string => prefix + ++uid;

const funcToString = Function.prototype.toString;
const objProto = Object.prototype;
const objToString = objProto.toString;
const hasOwnProperty = objProto.hasOwnProperty;
const objectCtorString = funcToString.call(Object);

/**
 * Checks if a passed-in value has a `typeof` of `object`.
 *
 * @param {*} value Value to check
 * @returns {boolean}
 * @example
 * import { isObjectLike } from 'yuzu-utils';
 *
 * isObjectLike({}) === true
 * isObjectLike(false) === false
 * isObjectLike([]) === true
 */
export const isObjectLike = (value: any): boolean =>
  !!value && typeof value === 'object';

/**
 * Checks if a value is a plain object (aka: _POJO_).
 *
 * @param {*} value Value to check
 * @returns {boolean}
 * @example
 * import { isPlainObject } from 'yuzu-utils';
 *
 * isPlainObject({}) === true
 * isPlainObject([]) === false
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
 * Checks if a value is a DOM element.
 *
 * @param {*} value Value to check
 * @returns {boolean}
 * @example
 * import { isElement } from 'yuzu-utils';
 *
 * isPlainObject(document.body) === true
 * isPlainObject([]) === false
 */
export const isElement = (value: any): value is Element =>
  !!value &&
  value.nodeType === 1 &&
  isObjectLike(value) &&
  !isPlainObject(value);

/**
 * If `value` is a function executes it with passed-in arguments and returns its result,
 * otherwise returns `value`.
 *
 * @param {any} value
 * @param {...args} args Optional arguments
 * @return {*}
 * @example
 * import { evaluate } from 'yuzu-utils';
 *
 * const yesNo = (v) => v ? 'yes' : 'no';
 *
 * evaluate(yesNo, false) === 'no'
 * evaluate(yesNo, true) === 'yes'
 * evaluate(true) === true
 */
export const evaluate = <T = any>(
  value: T,
  ...args: any[]
): T extends fn ? ReturnType<T> : T => {
  return typeof value === 'function' ? value(...args) : value;
};

/**
 * Binds the `this` context of a function to a passed-in object.
 *
 * If `method` is a string it will try to resolve the function as a member of the context object.
 *
 * @param {object} ctx Context
 * @param {string|function} method Function to bind
 * @example
 * import { evaluate } from 'yuzu-utils';
 *
 * const user = {
 *   name: 'John',
 *   surname: 'Doe',
 *   toLower() {
 *    this.name.toLowerCase();
 *   }
 * };
 *
 * const userMethods = {
 *
 * };
 *
 * function fullName () {
 *   return `${this.name} ${this.surname}`;
 * }
 *
 * const boundFullName = bindMethod(user, fullName);
 * boundFullName() === 'John Doe'
 *
 * const boundMethod = bindMethod(user, 'toLower');
 * boundMethod() === 'john'
 */
export const bindMethod = (ctx: any, method: string | fn): fn => {
  if (typeof method === 'string') {
    if (typeof ctx[method] === 'function') {
      return (...args: any[]) => ctx[method](...args);
    }
    throw new TypeError(`Property ${method} should be a function`);
  }
  return (method as fn).bind(ctx);
};

/**
 * Accepts a value and tries to parse it as boolean, number or JSON.
 *
 * @name parseString
 * @function
 * @private
 * @param {any} value - Value to parse
 * @returns {*}
 * @example
 * import { parseString } from 'yuzu-utils';
 *
 * parseString('true') === true
 * parseString('1') === 1
 * parseString('{ "name": "John" }') === { name: 'John' }
 * parseString('    John Doe   ') === 'John Doe'
 */
export const parseString = (value: any): any => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const v = value.trim();

  if (v === '' || v === 'true') {
    return true;
  }

  if (v === 'false') {
    return false;
  }

  const n = Number(v);

  if (!Number.isNaN(n)) {
    return n;
  }

  try {
    return JSON.parse(v);
  } catch (e) {
    return v;
  }
};

export const INLINE_STATE_REGEXP = /^ui([A-Z].+)$/;

/**
 * Parses an element's `dataset` with optional filtering.
 *
 * @param {HTMLElement} el HTML element
 * @param {RegExp} [matcher] Optional regexp to filter dataset by key (defaults to `/^ui([A-Z].+)$/`)
 * @param {function} [formatter=parseString] Optional formatter function.
 * @returns {object}
 * @example
 *
 * // html:
 * // <div id="demo" data-ui-bool data-ui-dashed-value="John">
 *
 * import { datasetParser, qs } from 'yuzu-utils';
 *
 * const data = datasetParser(qs('#demo'));
 *
 * data.bool === true
 * data.dashedValue === 'John'
 */
export const datasetParser = (
  el: HTMLElement,
  matcher = INLINE_STATE_REGEXP,
  formatter = parseString,
) => {
  return Object.entries(el.dataset).reduce((acc: IObject, [key, value]) => {
    if (matcher.test(key)) {
      const newKey = key.replace(
        matcher,
        (_, m) => `${m[0].toLowerCase()}${m.slice(1)}`,
      );
      acc[newKey] = formatter(value);
    }
    return acc;
  }, {});
};

/**
 * Returns the first element within the document that matches the specified group of selectors.
 *
 * @name qs
 * @function
 * @param {string} selector - CSS selector
 * @param {Element|Document} [ctx=document] - Root element. `document` by default
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector
 * @return {Element|null}
 * @example
 * import { qs } from 'yuzu-utils';
 *
 * const content = qs('#main-content');
 */
export const qs = (
  selector: string,
  ctx: Document | Element = document,
): Element | null => ctx.querySelector(selector);

/**
 * Returns a list of the elements within the document that match the specified group of selectors.
 *
 * @name qsa
 * @function
 * @param {string} selector - One or more CSS selectors separated by commas.
 * @param {Element|Document} [ctx=document] - Root element. `document` by default
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelectorAll
 * @return {Array}
 * @example
 * import { qsa } from 'yuzu-utils';
 *
 * const listItems = qsa('.list .list-items');
 */
export const qsa = (
  selector: string,
  ctx: Element | Document = document,
): HTMLElement[] => Array.from(ctx.querySelectorAll(selector));

// tslint:disable-next-line: interface-name no-empty-interface
export interface Events extends Idush {}

export class Events implements Idush {
  constructor() {
    Object.assign(this, dush());
  }
}
