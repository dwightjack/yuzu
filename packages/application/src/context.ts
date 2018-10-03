import { Component } from '@yuzu/core';
import { IObject } from '@yuzu/core/types';

export interface IContext {
  getData(): IObject;
  update(payload: IObject): void;
  inject(instance: Component): Component;
}
/**
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
     * Returns the context internal data.
     *
     * @memberof Context
     * @return {object}
     * @example
     * const context = createContext({ theme: 'dark' });
     * context.getData().theme === 'dark';
     */
    getData() {
      return $data;
    },

    /**
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
    update(payload: IObject) {
      $data = payload;
    },

    /**
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
    inject(instance: Component) {
      Object.defineProperty(instance, '$context', {
        enumerable: false,
        get: () => $data,
      });
      return instance;
    },
  };
};
