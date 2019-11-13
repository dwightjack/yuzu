import { Component } from 'yuzu';
import { IObject } from 'yuzu/types';

export interface IContext {
  getData(): IObject;
  update(payload: IObject): void;
  inject<C extends Component>(instance: C): C;
}
/**
 * ```js
 * createContext([data])
 * ```
 *
 * Returns a new context object
 *
 * @param {object} data Context internal data
 * @return {Context}
 * @example
 * const context = createContext({ theme: 'dark' });
 */
export const createContext = (data: IObject = {}): IContext => {
  let $data = data;

  /**
   * @typedef Context
   * @name Context
   * @type {Object}
   */
  return {
    /**
     * ```js
     * getData()
     * ```
     * Returns the context internal data.
     *
     * @memberof Context
     * @return {object}
     * @example
     * const context = createContext({ theme: 'dark' });
     * context.getData().theme === 'dark';
     */
    getData(): IObject {
      return $data;
    },

    /**
     * ```js
     * update(data)
     * ```
     *
     * Replaces the context internal data.
     *
     * @memberof Context
     * @param {object} payload
     * @example
     * const context = createContext({ theme: 'dark' });
     *
     * context.update({ theme: 'light ' });
     * context.getData().theme === 'light';
     */
    update(payload: IObject): void {
      $data = payload;
    },

    /**
     * ```js
     * inject(component)
     * ```
     *
     * Attaches the context data to a `$context` property of the passed-in component instance
     *
     * @memberof Context
     * @param {Component} instance Component instance
     * @example
     * const context = createContext({ theme: 'dark' });
     * const instance = new Component();
     *
     * context.inject(instance);
     *
     * instance.$context.theme === 'dark';
     */
    inject<C extends Component>(instance: C): C {
      Object.defineProperty(instance, '$context', {
        enumerable: false,
        get: () => $data,
      });
      return instance;
    },
  };
};
