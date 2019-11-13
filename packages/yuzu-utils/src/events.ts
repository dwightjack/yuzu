export type listenerFn = (...args: any[]) => void;

/**
 * Creates an event hub object.
 *
 * This is a port to ES6 of the [dush](https://github.com/tunnckoCoreLabs/dush) library.
 *
 * @class
 * @example
 * import { Events } from 'yuzu-utils';
 *
 * const events = new Events();
 *
 * events.on('log', (msg) => console.log(msg))
 *
 * events.emit('log', 'Hello world!') // logs 'Hello world!'
 */
export class Events {
  /**
   * @private
   */
  public _allEvents: {
    [key: string]: listenerFn[];
  };

  public constructor() {
    this._allEvents = Object.create(null);
  }

  /**
   * ```js
   * this.on(event, handler [, once])
   * ```
   * Adds an event handler for an event.
   *
   * @param  {string} name Event name to listen for, or `'*'` for all events
   * @param  {Function} handler Function to call
   * @param  {boolean} [once] Make `handler` be called only once, the `.once` method use this internally
   * @return {Event}
   * @example
   * const emitter = new Events()
   *
   * emitter
   *   .on('hi', (place) => {
   *     console.log(`hello ${place}!`) // => 'hello world!'
   *   })
   *   .on('hi', (place) => {
   *     console.log(`hi ${place}, yeah!`) // => 'hi world, yeah!'
   *   })
   *
   * emitter.emit('hi', 'world')
   */
  public on(name: string, handler: listenerFn, once?: boolean): this {
    const e = this._allEvents[name] || (this._allEvents[name] = []);

    const func = (...args: any[]): void => {
      this.off(name, func);
      handler(...args);
    };
    func.fn = handler;

    const fn = once ? func : handler;

    e.push(fn);
    return this;
  }

  /**
   * ```js
   * this.once(event, handler)
   * ```
   *
   * Like `.on` but calls the handler just once.
   *
   * @param  {string} name Event name to listen for, or `'*'` for all events
   * @param  {function} handler Function to call
   * @return {Events}
   * @example
   * const emitter = new Events()
   * let called = 0
   *
   * emitter.once('foo', () => {
   *   console.log('called only once')
   *   called++
   * })
   *
   * emitter.emit('foo')
   * emitter.emit('foo')
   * emitter.emit('foo')
   *
   * console.log(called) // => 1
   */
  public once(name: string, handler: listenerFn): this {
    this.on(name, handler, true);
    return this;
  }

  /**
   * ```js
   * this.off([event [, handler]])
   * ```
   *
   * Removes an event listener for `name` event. If `handler` is not specified it will remove **all** listeners for that `name` event.
   * If `name` is not specified as well, it will then remove all registered event handlers.
   *
   * @param {string} [name] Event name
   * @param {function} [handler] Handler to remove
   * @return {Events}
   * @example
   * const emitter = new Events()
   *
   * const handler = () => {
   *   console.log('not called')
   * }
   *
   * emitter.on('foo', handler)
   *
   * // remove just an handler
   * emitter.off('foo', handler)
   *
   * // remove all listeners for `foo`
   * emitter.off('foo')
   *
   * // remove all listeners
   * emitter.off()
   */
  public off(name?: string, handler?: listenerFn): this {
    if (name && handler && this._allEvents[name]) {
      this._allEvents[name] = this._allEvents[name].filter(
        (func) => func !== handler && func !== (handler as any).fn,
      );
    } else if (name) {
      this._allEvents[name] = [];
    } else {
      this._allEvents = Object.create(null);
    }

    return this;
  }

  /**
   * ```js
   * this.emit(event [, ...args])
   * ```
   *
   * Emits an event with optional parameters.
   * Will call every handler registered for the wildcard event `'*'` as well
   *
   * @param {string} name The name of the event to invoke
   * @param {...*} args Any number of arguments of any type of value, passed to each listener
   * @return {Events}
   * @example
   * const emitter = new Events()
   *
   * emitter.on('foo', (a, b, c) => {
   *   console.log(`${a}, ${b}, ${c}`) // => 1, 2, 3
   * })
   *
   * emitter.on('*', (name, a, b, c) => {
   *   console.log(`event name is: ${name}`)
   *   console.log(`args are: ${a}, ${b}, ${c}`)
   * })
   *
   * emitter.emit('foo', 1, 2, 3)
   * emitter.emit('bar', 555)
   */
  public emit(name: string, ...args: any[]): this {
    const { _allEvents } = this;
    if (name !== '*') {
      if (_allEvents[name]) {
        _allEvents[name].map((handler) => {
          handler(...args);
        });
      }
      if (_allEvents['*']) {
        _allEvents['*'].map((handler) => {
          handler(name, ...args);
        });
      }
    }

    return this;
  }
}
