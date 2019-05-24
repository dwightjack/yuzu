import { Events } from '../src/events';

describe('`Events`', () => {
  let app: Events;
  beforeEach(() => {
    app = new Events();
  });

  it('should return an instance with methods and `._allEvents` object', () => {
    expect(typeof app._allEvents).toBe('object');
    expect(typeof app.on).toBe('function');
    expect(typeof app.off).toBe('function');
    expect(typeof app.once).toBe('function');
    expect(typeof app.emit).toBe('function');
  });

  describe('.on', () => {
    it('should return the instance', () => {
      expect(app.on('test', () => {})).toBe(app);
    });

    it('should instance has ._allEvents object that contains all handlers', () => {
      const fn = (): void => {};

      app.on('aaa', fn);
      app.on('aaa', fn);
      app.on('bbb', fn);
      app.on('ccc', fn);
      app.on('ccc', fn);
      app.on('ccc', fn);

      expect(Object.keys(app._allEvents)).toEqual(['aaa', 'bbb', 'ccc']);
      expect(app._allEvents.aaa).toEqual([fn, fn]);
      expect(app._allEvents.bbb.length).toBe(1);
      expect(app._allEvents.ccc.length).toBe(3);
    });

    it('should register handlers for any type of string', () => {
      const spy = jasmine.createSpy();
      app.on('constructor', spy);
      app.emit('constructor', 2);
      expect(spy).toHaveBeenCalledWith(2);
    });

    it('should .on register multiple handlers', () => {
      const spy = jasmine.createSpy();
      app.on('foo', spy);
      app.on('foo', spy);
      app.emit('foo');
      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('should support wildcard event', () => {
      const spy = jasmine.createSpy();
      app.on('*', spy);
      app.emit('haha', 1);
      expect(spy).toHaveBeenCalledWith('haha', 1);
    });

    it('should be able to pass context to listener', () => {
      const spy = jasmine.createSpy();
      const ctx = { aaa: 'bbb' };

      app.on('ctx', spy.bind(ctx));
      app.emit('ctx');

      expect(spy.calls.mostRecent().object).toBe(ctx);
    });

    it('`.on` work as `.once` if third argument is true', () => {
      const spy = jasmine.createSpy();

      app.on('onetime', spy, true);
      app.emit('onetime');
      app.emit('onetime');
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('.emit', () => {
    it('should return the instance', () => {
      expect(app.emit('test')).toBe(app);
    });

    it('should .emit with multiple params (maximum 3)', () => {
      const spy = jasmine.createSpy();
      app.on('foo', spy);
      app.emit('foo', 'aaa', 'bbb');
      expect(spy).toHaveBeenCalledWith('aaa', 'bbb');
    });

    it('should not allow emitting the wildcard (issue#5)', () => {
      const spy = jasmine.createSpy();

      app.on('*', spy);
      app.emit('*', 1);
      expect(spy).not.toHaveBeenCalled();

      app.emit('foo', 2);
      expect(spy).not.toHaveBeenCalledWith(2);
    });

    it('should not add additional arguments when emit', () => {
      const spy = jasmine.createSpy();
      app.on('foo', spy);
      app.emit('foo', 1);
      expect(spy.calls.argsFor(0)).toEqual([1]);
    });

    it('should support to emit any number of arguments', () => {
      const spy = jasmine.createSpy();
      app.on('zazzie', spy);
      app.emit('zazzie', 1, 2, 3, 4, 5);
      expect(spy).toHaveBeenCalledWith(1, 2, 3, 4, 5);
    });
  });

  describe('.once', () => {
    it('should return the instance', () => {
      expect(app.once('test', () => {})).toBe(app);
    });

    it('handlers added with .once be called one time only', () => {
      const spy = jasmine.createSpy();
      app.once('bar', spy);

      app.emit('bar');
      app.emit('bar');
      app.emit('bar');

      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('.off', () => {
    it('should return the instance', () => {
      expect(app.off('test')).toBe(app);
    });

    it('should .off("foo", fn) remove the handler', () => {
      const spy = jasmine.createSpy();
      const spy2 = jasmine.createSpy();

      app.on('qux', spy);
      app.on('qux', spy2);
      app.off('qux', spy);
      app.emit('qux');

      expect(spy).not.toHaveBeenCalled();
      expect(spy2).toHaveBeenCalledTimes(1);
      expect(app._allEvents.qux.length).toBe(1);
    });

    it('should .off("foo") remove all "foo" handlers', () => {
      app.on('zzz', () => {});
      app.on('zzz', () => {});
      app.off('zzz');

      expect(app._allEvents.zzz.length).toBe(0);
    });

    it('should be able to `.off` the `.once` listeners (issue #7)', () => {
      const spy = jasmine.createSpy();
      app.once('test', spy);
      app.emit('test');
      app.emit('test');
      expect(spy).toHaveBeenCalledTimes(1);

      spy.calls.reset();
      app.off('test', spy);
      app.emit('test');
      expect(spy).not.toHaveBeenCalled();
    });

    it('`.off()` remove all listeners', () => {
      const spy = jasmine.createSpy();

      app.on('a', spy);
      app.once('a', spy);
      app.on('a', spy);
      app.on('b', spy);
      app.once('b', spy);
      app.on('c', spy);

      const events = Object.keys(app._allEvents);
      expect(events.length).toBe(3);

      app.off();
      const allEvents = Object.keys(app._allEvents);
      expect(allEvents.length).toBe(0);
    });

    it('should `.off()` be able to differentiate between similar handler functions', () => {
      var calls = 0;
      const funcA = function(): void {
        calls++;
      };
      const funcB = function(): void {
        calls++;
      };
      app.on('a', funcA);
      app.on('a', funcB);
      app.emit('a');
      expect(calls).toBe(2);
      app.off('a', funcB);
      app.emit('a');
      expect(calls).toBe(3);
      app.off('a', funcA);
      app.emit('a');
      expect(calls).toBe(3);
    });
  });
});
