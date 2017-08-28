import expect from 'expect';
import tsumami from 'tsumami';
import { mount as mountHTML } from './utils';
import Component from '../src/component';
import mount from '../src/mount';

describe('`mount`', () => {

    describe('Mounter function setup', () => {

        it('should create a new instance from the component constructor', () => {

            const spy = expect.createSpy();
            const Fake = function Fake() { spy(this); };
            mount(Fake);

            expect(spy).toHaveBeenCalled();
            expect(spy.calls[0].arguments[0].constructor).toBe(Fake);

        });

        it('should pass provided options to the constructor', () => {
            const Fake = expect.createSpy();
            const options = {};
            mount(Fake, null, options);

            expect(Fake).toHaveBeenCalledWith(undefined, options);
        });

        it('should return a function', () => {
            expect(mount(Component)).toBeA(Function);
        });

    });

    describe('Mounter function', () => {


        beforeEach(() => {
            mountHTML('component.html');
        });

        it('should resolve to an element when a context is passed-in', () => {

            const ctx = new Component('#ref');
            const child = ctx.$el.querySelector('.child');
            const mounter = mount(Component, '.child');
            const spy = tsumami.qs.mock(() => expect.createSpy().andReturn(child));

            mounter(null, ctx);

            expect(spy).toHaveBeenCalledWith('.child', ctx.$el);

            tsumami.qs.restore();

        });

        it('should call `.mount()` on generated component', () => {
            const root = document.getElementById('app');
            const MyComponent = Component.create();
            const spy = expect.spyOn(MyComponent.prototype, 'mount').andCallThrough();

            mount(MyComponent, root)();

            expect(spy).toHaveBeenCalledWith(root);
        });

        it('should NOT initialize generated component if a context is provided', () => {
            const ctx = new Component('#ref');
            const MyComponent = Component.create();
            const spy = expect.spyOn(MyComponent.prototype, 'init').andCallThrough();

            mount(MyComponent, '.child')(null, ctx);

            expect(spy).toNotHaveBeenCalled();
        });

        it('should initialize generated component with provided state', () => {
            const MyComponent = Component.create();
            const spy = expect.spyOn(MyComponent.prototype, 'init').andCallThrough();
            const state = {};

            mount(MyComponent, '#app')(state);

            expect(spy).toHaveBeenCalledWith(state);
        });

        it('should return a component instance', () => {
            const MyComponent = Component.create();

            const returned = mount(MyComponent, '#app')();

            expect(returned).toBeA(MyComponent);

        });

    });


    describe('Children management', () => {

        it('should execute child-as-a-function children argument', () => {
            const spy = expect.createSpy().andReturn([]);
            const MyComponent = Component.create();

            mount(MyComponent, '#app', null, spy)();

            expect(spy).toHaveBeenCalled();
            expect(spy.calls[0].arguments.length).toBe(1);
            expect(spy.calls[0].arguments[0]).toBeA(MyComponent);


        });

        it('should cycle children and call them with no state and root component as arguments', () => {
            const spy = expect.createSpy().andReturn(new Component(document.createElement('div')));
            const MyComponent = Component.create();

            mount(MyComponent, '#app', null, [spy, spy])();

            expect(spy.calls.length).toBe(2);

            for (let i = 0; i < spy.calls.length; i += 1) {
                const call = spy.calls[i];
                expect(call.arguments.length).toBe(2);
                expect(call.arguments[0]).toBe(undefined);
                expect(call.arguments[1]).toBeA(MyComponent);
            }

        });

        it('should cycle children as-a-function results', () => {
            const spy = expect.createSpy().andReturn(new Component(document.createElement('div')));
            const MyComponent = Component.create();

            mount(MyComponent, '#app', null, () => [spy, spy])();

            expect(spy.calls.length).toBe(2);

            for (let i = 0; i < spy.calls.length; i += 1) {
                const call = spy.calls[i];
                expect(call.arguments.length).toBe(2);
                expect(call.arguments[0]).toBe(undefined);
                expect(call.arguments[1]).toBeA(MyComponent);
            }

        });

        it('should attach children to root component', () => {
            const child = () => new Component(document.createElement('div'));
            const MyComponent = Component.create();
            const spy = expect.spyOn(MyComponent.prototype, 'setRef');

            mount(MyComponent, '#app', null, [child])();

            expect(spy).toHaveBeenCalled();

        });

        it('should pass child component instance', () => {
            const childInstance = new Component(document.createElement('div'));
            const child = () => childInstance;
            const MyComponent = Component.create();
            const spy = expect.spyOn(MyComponent.prototype, 'setRef');

            mount(MyComponent, '#app', null, [child])();
            const arg = spy.calls[0].arguments[0];
            expect(arg.component).toBe(childInstance);

        });

        it('should assign `options.id` as the reference id', () => {
            const childInstance = new Component(document.createElement('div'), { id: 'X' });
            const child = () => childInstance;
            const MyComponent = Component.create();
            const spy = expect.spyOn(MyComponent.prototype, 'setRef');

            mount(MyComponent, '#app', null, [child])();
            const arg = spy.calls[0].arguments[0];
            expect(arg.id).toBe('X');

        });

        it('should assign an auto-generated id if NOTprovided', () => {
            const childInstance = new Component(document.createElement('div'));
            const child = () => childInstance;
            const MyComponent = Component.create();
            const spy = expect.spyOn(MyComponent.prototype, 'setRef');

            const root = mount(MyComponent, '#app', null, [child])();
            const arg = spy.calls[0].arguments[0];
            expect(arg.id).toBe(`${root._uid}__0`);

        });

        it('should pass configured props to the reference', () => {
            const props = {};
            const childInstance = new Component(document.createElement('div'), { props });
            const child = () => childInstance;
            const MyComponent = Component.create();
            const spy = expect.spyOn(MyComponent.prototype, 'setRef');

            mount(MyComponent, '#app', null, [child])();
            const arg = spy.calls[0].arguments[0];
            expect(arg.props).toBe(props);

        });

    });
});