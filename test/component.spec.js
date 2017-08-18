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