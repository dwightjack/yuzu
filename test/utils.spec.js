import expect from 'expect';

import * as utils from '../src/utils';

// import {mount} from './utils';

describe('`Utils`', () => {


    describe('`nextUid`', () => {

        const extract = (str) => parseInt(str.match(/[0-9]+?$/)[0], 10);

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

            //falsy values
            expect(fn(0)).toBe(false);
            expect(fn('')).toBe(false);
            expect(fn()).toBe(false);
            expect(fn(null)).toBe(false);
            expect(fn(false)).toBe(false);

            //truthy values
            expect(fn(true)).toBe(false);
            expect(fn('string')).toBe(false);
            expect(fn(1)).toBe(false);

            const noop = () => {};
            expect(fn(noop)).toBe(false);

            //works
            expect(fn({})).toBe(true);
            expect(fn([])).toBe(true);

            //casted object
            expect(fn(Object(1))).toBe(true);

        });
    });

    //based on https://github.com/lodash/lodash/blob/3203/test/test.js#L11392
    describe('`isPlainObject`', () => {

        it('should detect plain objects', () => {

            function Foo() {
                this.a = 1;
            }

            expect(utils.isPlainObject({})).toBe(true);
            expect(utils.isPlainObject({ a: 1 })).toBe(true);
            expect(utils.isPlainObject({ constructor: Foo })).toBe(true);
            expect(utils.isPlainObject([1, 2, 3])).toBe(false);
            expect(utils.isPlainObject(new Foo(1))).toBe(false);
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

            expect(utils.isPlainObject(arguments)).toBe(false); //eslint-disable-line
            expect(utils.isPlainObject(Error)).toBe(false);
            expect(utils.isPlainObject(Math)).toBe(false);
        });

        it('should return `false` for non-objects', () => {

            expect(utils.isPlainObject(true)).toBe(false);
            expect(utils.isPlainObject('a')).toBe(false);
            expect(utils.isPlainObject([])).toBe(false);
        });

        it('should return `false` for objects with a read-only `Symbol.toStringTag` property', function toStringTag() {
            if (window.Symbol && window.Symbol.toStringTag) {
                const object = {};
                Object.defineProperty(object, window.Symbol.toStringTag, {
                    configurable: true,
                    enumerable: false,
                    writable: false,
                    value: 'X'
                });

                expect(utils.isPlainObject(object)).toBe(false);
            } else {
                this.skip();
            }
        });
    });


    //see https://github.com/lodash/lodash/blob/3203/test/test.js#L9251
    describe('`isElement()`', () => {

        it('should return `true` for elements', () => {
            expect(utils.isElement(document.body)).toBe(true);
        });

        it('should return `true` for non-plain objects', () => {
            function Foo() { this.nodeType = 1; }
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

    describe('`extend`', () => {

        it('should break if target object is `undefined`', () => {

            expect(() => {
                utils.extend(undefined, {});
            }).toThrow();

        });

        it('should break if target object is `null`', () => {

            expect(() => {
                utils.extend(null, {});
            }).toThrow();

        });

        it('should merge objects properties', () => {
            expect(utils.extend({ a: 1 }, { b: 2 })).toMatch({ a: 1, b: 2 });
        });

        it('should skip non-enumerable properties', () => {

            const target = { a: 1 };
            const source = {};

            Object.defineProperty(source, 'b', {
                enumerable: false,
                value: 'X'
            });

            expect(utils.extend(target, source)).toNotContainKey('b');
        });

        it('should copy just owned properties', () => {
            function F() { this.b = 2; }
            F.prototype.a = 1;
            const obj = new F();

            expect(utils.extend({}, obj)).toMatch({ b: 2 });
        });

        it('should accept multiple sources', () => {
            expect(utils.extend({ a: 1 }, { b: 2 }, { c: 3 })).toMatch({ a: 1, b: 2, c: 3 });
        });

        it('should overwrite leftmost properties with rightmost properties', () => {
            expect(utils.extend({ a: 0, b: 0, c: 3 }, { a: 1 }, { a: 1, b: 2 })).toMatch({ a: 1, b: 2, c: 3 });
        });

    });
});