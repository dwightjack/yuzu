import expect from 'expect';
import tsumami from 'tsumami';
import { mount } from './utils';
import Component from '../src/component';
import Children from '../src/children';

// import {mount} from './utils';

describe('`Children`', () => {

    let root;
    const noop = () => {};

    beforeEach(() => {
        mount('component.html');
        root = new Component('#ref');
    });

    it('should return a function', () => {
        expect(Children('.item', noop)).toBeA(Function);
    });

    it('should query the selector in the `parentComponent.$el` context', () => {
        const selector = '.item';
        const iterator = Children(selector, noop);
        const spy = tsumami.qsa.mock();

        iterator(root);

        expect(spy).toHaveBeenCalledWith(selector, root.$el);

        tsumami.qsa.restore();
    });

    it('should call a function on every matched element', () => {
        const selector = '.item';
        const spy = expect.createSpy();
        const iterator = Children(selector, spy);
        const els = root.$el.querySelectorAll(selector);

        iterator(root);

        expect(spy.calls.length).toBe(els.length);

        for (let i = 0; i < els.length; i += 1) {
            expect(spy.calls[i].arguments).toMatch([els[i], i]);
        }

    });

    it('should return the iterator function result as an array', () => {
        const selector = '.item';
        const fn = (el, i) => i + 1;
        const iterator = Children(selector, fn);

        const results = iterator(root);

        expect(results).toMatch([1, 2]);

    });
});