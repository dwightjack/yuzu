import * as utils from '../src/index';
import { mount } from 'yuzu-test-tools';

describe('`Utils`', () => {
  describe('`noop`', () => {
    it('should be a function', () => {
      expect(utils.noop).toEqual(jasmine.any(Function));
    });
    it('should return undefined', () => {
      expect(utils.noop()).toBeUndefined();
    });
  });

  describe('`createSequence`', () => {
    it('should return a function', () => {
      expect(utils.createSequence()).toEqual(jasmine.any(Function));
    });

    it('should start from -1', () => {
      const seq = utils.createSequence();
      expect(seq()).toMatch(/0$/);
    });

    it('should take an optional start number', () => {
      const seq = utils.createSequence(9);
      expect(seq()).toMatch(/10$/);
    });
  });

  describe('`nextUid`', () => {
    const extract = (str: string): number =>
      parseInt((str.match(/[0-9]+?$/) || [])[0], 10);

    it('should compose a numeric uid', () => {
      expect(utils.nextUid()).toMatch(/[0-9]+?$/);
    });

    it('should compose a progressive uids', () => {
      const uid = utils.nextUid();
      const num = extract(uid);
      const next = extract(utils.nextUid());
      const expected = num + 1;

      expect(next).toBe(expected);
    });

    it('should default to `UID_PREFIX`', () => {
      const match = new RegExp(`^${utils.UID_PREFIX}[0-9]+$`);
      expect(utils.nextUid()).toMatch(match);
    });

    it('should allow a custom prefix', () => {
      expect(utils.nextUid('myprefix')).toMatch(/^myprefix[0-9]+$/);
    });
  });

  describe('`isObjectLike`', () => {
    it('should return true on truthy values with a typeof of `object`', () => {
      const fn = utils.isObjectLike;

      // falsy values
      expect(fn(0)).toBe(false);
      expect(fn('')).toBe(false);
      expect(fn(undefined)).toBe(false);
      expect(fn(null)).toBe(false);
      expect(fn(false)).toBe(false);

      // truthy values
      expect(fn(true)).toBe(false);
      expect(fn('string')).toBe(false);
      expect(fn(1)).toBe(false);

      const noop = (): void => undefined;
      expect(fn(noop)).toBe(false);

      // works
      expect(fn({})).toBe(true);
      expect(fn([])).toBe(true);

      // casted object
      expect(fn(Object(1))).toBe(true);
    });
  });

  // based on https://github.com/lodash/lodash/blob/3203/test/test.js#L11392
  describe('`isPlainObject`', () => {
    it('should detect plain objects', () => {
      class Foo {
        public a = 1;
      }

      expect(utils.isPlainObject({})).toBe(true);
      expect(utils.isPlainObject({ a: 1 })).toBe(true);
      expect(utils.isPlainObject({ constructor: Foo })).toBe(true);
      expect(utils.isPlainObject([1, 2, 3])).toBe(false);
      expect(utils.isPlainObject(new Foo())).toBe(false);
    });

    it('should return `true` for objects with a `[[Prototype]]` of `null`', () => {
      const object = Object.create(null);
      expect(utils.isPlainObject(object)).toBe(true);

      object.constructor = Object.prototype.constructor;
      expect(utils.isPlainObject(object)).toBe(true);
    });

    it('should return `true` for objects with a `valueOf` property', () => {
      expect(utils.isPlainObject({ valueOf: 0 })).toBe(true);
    });

    it('should return `false` for objects with a custom `[[Prototype]]`', () => {
      const object = Object.create({ a: 1 });
      expect(utils.isPlainObject(object)).toBe(false);
    });

    it('should return `false` for DOM elements', () => {
      const element = document.createElement('div');
      expect(utils.isPlainObject(element)).toBe(false);
    });

    it('should return `false` for non-Object objects', function nonObj() {
      // eslint-disable-next-line prefer-rest-params
      expect(utils.isPlainObject(arguments)).toBe(false);
      expect(utils.isPlainObject(Error)).toBe(false);
      expect(utils.isPlainObject(Math)).toBe(false);
    });

    it('should return `false` for non-objects', () => {
      expect(utils.isPlainObject(true)).toBe(false);
      expect(utils.isPlainObject('a')).toBe(false);
      expect(utils.isPlainObject([])).toBe(false);
    });

    it('should return `false` for objects with a read-only `Symbol.toStringTag` property', function toStringTag() {
      if (Symbol && Symbol.toStringTag) {
        const object = {};
        Object.defineProperty(object, Symbol.toStringTag, {
          configurable: true,
          enumerable: false,
          writable: false,
          value: 'X',
        });

        expect(utils.isPlainObject(object)).toBe(false);
      } else {
        expect(true).toBe(true);
      }
    });
  });

  // see https://github.com/lodash/lodash/blob/3203/test/test.js#L9251
  describe('`isElement()`', () => {
    it('should return `true` for elements', () => {
      expect(utils.isElement(document.body)).toBe(true);
    });

    it('should return `true` for non-plain objects', () => {
      class Foo {
        public nodeType = 1;
      }

      expect(utils.isElement(new Foo())).toBe(true);
    });

    it('should return `false` for non DOM elements', () => {
      expect(utils.isElement([1, 2, 3])).toBe(false);
      expect(utils.isElement(true)).toBe(false);
      expect(utils.isElement(new Date())).toBe(false);
      expect(utils.isElement(new Error())).toBe(false);
      expect(utils.isElement({ a: 1 })).toBe(false);
      expect(utils.isElement(1)).toBe(false);
      expect(utils.isElement(/x/)).toBe(false);
      expect(utils.isElement('a')).toBe(false);
    });

    it('should return `false` for plain objects', () => {
      expect(utils.isElement({ nodeType: 1 })).toBe(false);
      expect(utils.isElement({ nodeType: Object(1) })).toBe(false);
      expect(utils.isElement({ nodeType: true })).toBe(false);
      expect(utils.isElement({ nodeType: [1] })).toBe(false);
      expect(utils.isElement({ nodeType: '1' })).toBe(false);
      expect(utils.isElement({ nodeType: '001' })).toBe(false);
    });
  });

  describe('`evaluate()`', () => {
    it('should return the first parameter if it is NOT a function', () => {
      const param = 'string';
      expect(utils.evaluate(param, 2)).toBe(param);
    });
    it('should execute the first parameter if it is a function', () => {
      const param = jasmine.createSpy();
      utils.evaluate(param);
      expect(param).toHaveBeenCalled();
    });
    it('should pass additional arguments to the function', () => {
      const param = jasmine.createSpy();
      utils.evaluate(param, 1, 2);
      expect(param).toHaveBeenCalledWith(1, 2);
    });
    it('should resolve to the return value of the function', () => {
      const param = jasmine.createSpy().and.returnValue(1);
      expect(utils.evaluate(param)).toBe(1);
    });
  });

  describe('`bindMethod()`', () => {
    let ctx: { [key: string]: any };

    beforeEach(() => {
      ctx = {
        negate: () => false,
        demo: jasmine.createSpy(),
        prop: false,
      };
    });

    it('should return a function', () => {
      const fn = utils.bindMethod(ctx, 'demo');
      expect(fn).toEqual(jasmine.any(Function));
    });

    it('should bind a method to its context', () => {
      const fn = utils.bindMethod(ctx, 'demo');
      fn();
      expect(ctx.demo.calls.mostRecent().object).toBe(ctx);
    });

    it('should invoke the method with passed-in arguments', () => {
      const fn = utils.bindMethod(ctx, 'demo');
      fn(1);
      expect(ctx.demo).toHaveBeenCalledWith(1);
    });

    it('should return the method return value ', () => {
      const fn = utils.bindMethod(ctx, 'demo');
      ctx.demo.and.returnValue(false);
      expect(fn(1)).toBe(false);
    });

    it('should throw if passed-in method is not a method of the context', () => {
      expect(() => utils.bindMethod(ctx, 'prop')).toThrowError(TypeError);
    });

    it('binds non-string arguments', () => {
      const spy = spyOn(ctx.negate, 'bind');
      utils.bindMethod(ctx, ctx.negate);
      expect(spy).toHaveBeenCalledWith(ctx);
    });
  });

  describe('`parseString()`', () => {
    it('should accept just string values', () => {
      const ps = utils.parseString;

      expect(ps([])).toBe(undefined);
      expect(ps({})).toBe(undefined);
      expect(ps(10)).toBe(undefined);
      expect(ps(true)).toBe(undefined);
      expect(ps(null)).toBe(undefined);
      expect(ps(undefined)).toBe(undefined);
      expect(ps('string')).toEqual(jasmine.any(String));
    });

    it('should return string value', () => {
      expect(utils.parseString('test')).toBe('test');
    });

    it('should return trimmed string value', () => {
      expect(utils.parseString('   trim   ')).toBe('trim');
    });

    it('should parse a numeric value into a float', () => {
      expect(utils.parseString('10')).toBe(10);
      expect(utils.parseString('10.20')).toBe(10.2);
      expect(utils.parseString('8e5')).toBe(8e5);
    });

    it('should parse string booleans in "real" booleans', () => {
      expect(utils.parseString('true')).toBe(true);
      expect(utils.parseString('false')).toBe(false);
    });

    it('should parse JSON strings', () => {
      const obj = { test: 'stub', prop: 10 };
      const str = JSON.stringify(obj);

      expect(utils.parseString(str)).toEqual(obj);
    });
  });

  describe('`datasetParser()`', () => {
    let el: HTMLElement;
    beforeEach(() => {
      el = document.createElement('div');
      el.dataset.demo = 'value';
      el.dataset.uiValueString = 'value';
      el.dataset.uiNum = '0';
    });

    it('cycles dataset and filters data by key', () => {
      const matcher = /.*/;
      const spy = spyOn(matcher, 'test').and.returnValue(false);
      utils.datasetParser(el, matcher);
      expect(spy.calls.count()).toBe(3);
      expect(spy).toHaveBeenCalledWith('demo');
    });

    it('formats as pascalCase each matched Key', () => {
      const ret = utils.datasetParser(el);
      expect(Object.keys(ret)).toEqual(['valueString', 'num']);
    });

    it('calls the formatter on each matched key value', () => {
      const formatter = jasmine.createSpy().and.returnValue('');
      const ret = utils.datasetParser(el, utils.INLINE_STATE_REGEXP, formatter);
      expect(formatter.calls.count()).toBe(2);
      expect(formatter).toHaveBeenCalledWith('0');
      expect(ret).toEqual({
        valueString: '',
        num: '',
      });
    });
  });

  describe('`qs()`', () => {
    beforeEach(() => {
      mount('dom.html');
    });

    it('should query an element by CSS selector', () => {
      const result = utils.qs('#inner .list') as Element;

      expect(result).toEqual(jasmine.any(Element));
      expect(result.id).toBe('myInnerList');
    });

    it('should query an element with a context', () => {
      const result = utils.qs(
        '.list',
        document.getElementById('inner') as Element,
      ) as Element;

      expect(result).toEqual(jasmine.any(HTMLUListElement));
      expect(result.id).toBe('myInnerList');
    });
  });

  describe('`qsa()`', () => {
    beforeEach(() => {
      mount('dom.html');
    });

    it('should query elements by CSS selector and return an array', () => {
      const results = utils.qsa('#inner .list .list__item');

      expect(results).toEqual(jasmine.any(Array));
      expect(results.length).toBe(3);
    });

    it('should query an element with a context', () => {
      const results = utils.qsa(
        '.list .list__item',
        document.getElementById('inner') as Element,
      );

      expect(results).toEqual(jasmine.any(Array));
      expect(results.length).toBe(3);
    });

    it('should return an empty array if nothing matches', () => {
      const results = utils.qsa('not-found');

      expect(results).toEqual(jasmine.any(Array));
      expect(results.length).toBe(0);
    });
  });
});
