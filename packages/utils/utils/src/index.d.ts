export interface IObject<T = any> {
  [key: string]: T;
}

export type fn = (...args: any[]) => any;

/**
 * uid prefix
 *
 * @public
 * @type {string}
 */
export declare const UID_PREFIX: string;
/**
 * Void function
 */
export declare const noop: () => void;
/**
 * Returns a sequential uid
 */
export declare const nextUid: (prefix?: string) => string;
/**
 * Checks if a passed-in value has a `typeof` of `object`
 */
export declare const isObjectLike: (value: any) => boolean;
/**
 * Checks if a value is a plain object (aka: _POJO_)
 */
export declare const isPlainObject: (value: any) => value is IObject<any>;
/**
 * Checks if a value is a DOM element
 */
export declare const isElement: (value: any) => value is Element;
/**
 * If `value` is a function executes it with passed-in arguments and returns its result,
 * otherwise returns `value`
 * @param {any} value
 * @param {...args} args Optional arguments
 * @return {*}
 */
export declare const evaluate: <T = any>(
  value: T,
  ...args: any[]
) => T extends fn ? ReturnType<T> : T;
export declare const bindMethod: (ctx: any, method: string | fn) => fn;
export declare const INLINE_STATE_REGEXP: RegExp;
/**
 * Parses an element's `dataset` with optional filtering
 *
 * @param {RegExp} [matcher] Optional matcher to filter dataset by key
 * @returns {object}
 */
export declare const datasetParser: (el: HTMLElement, matcher?: RegExp) => {};
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
export declare const qs: (
  selector: string,
  ctx?: Element | Document,
) => Element;
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
export declare const qsa: (
  selector: string,
  ctx?: Element | Document,
) => HTMLElement[];
