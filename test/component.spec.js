import expect from 'expect';

import Component from '../src/component';

// import {mount} from './utils';

describe('`Component`', () => {

    describe('static `.create`', () => {

        it('should return a Component constructor', () => {

            const MyComp = Component.create();
            const inst = new MyComp();
            expect(inst).toBeA(Component);

        });

        it('should set the a Component\'s `prototype.constructor` as the constructor', () => {
            const MyComp = Component.create();
            expect(MyComp.prototype.constructor).toBe(MyComp);
        });

        it('should set a `__super__` property pointing to the parent prototype', () => {
            const MyComp = Component.create();
            expect(MyComp.__super__).toBe(Component.prototype); //eslint-disable-line no-underscore-dangle
        });

        it('should call the parent constructor with passed-in arguments', () => {
            const spy = expect.createSpy();
            const MyComp = Component.create.call(spy);
            const inst = new MyComp('a'); //eslint-disable-line

            expect(spy).toHaveBeenCalledWith('a');
        });

        it('should call the parent constructor with the child context', () => {
            const spy = expect.createSpy();
            const MyComp = Component.create.call(spy);
            const inst = new MyComp('a'); //eslint-disable-line
            expect(spy.calls[0].context).toBeA(MyComp);
        });

        it('should allow to define a custom constructor function', () => {
            const spy = expect.createSpy();
            const MyComp = Component.create({
                constructor: spy
            });
            const inst = new MyComp('a'); //eslint-disable-line
            expect(spy).toHaveBeenCalledWith('a');
        });

        it('should copy static properties and methods', () => {
            const MyComp = Component.create();
            expect(MyComp.create).toBeA(Function);
            expect(MyComp.create).toBe(Component.create);
        });

        it('should copy even custom statics', () => {
            const MyComp = Component.create();

            MyComp.aProp = true;
            MyComp.aMethod = () => {};

            const ChildComp = MyComp.create();

            expect(ChildComp.aProp).toBe(MyComp.aProp);
            expect(ChildComp.aMethod).toBe(MyComp.aMethod);
        });

        it('should accept custom prototype methods', () => {

            const MyComp = Component.create({
                aMethod() { }
            });

            expect(MyComp.prototype.aMethod).toBeA(Function);

        });

    });

});