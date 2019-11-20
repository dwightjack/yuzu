export interface IContext<D = {}> {
  getData(): Readonly<D>;
  update(payload: D): void;
  inject<C>(
    instance: C,
  ): C & {
    $context: D;
  };
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
export const createContext = <D = {}>(data: D = {} as D): IContext<D> => {
  let $data = data;

  /**
   * @typedef Context
   * @name Context
   * @type {Object}
   */
  const $ctx: IContext<D> = {
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
    getData() {
      return { ...$data };
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
    update(payload) {
      $data = { ...payload } as D;
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
    inject(instance) {
      return Object.defineProperty(instance, '$context', {
        enumerable: false,
        get: () => this.getData(),
      });
    },
  };

  return $ctx;
};
