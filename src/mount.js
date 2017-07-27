// @flow
import { qs } from 'tsumami';

import type Component from './component';

const mount = function mount(
    ComponentConstructor: Class<Component>,
    el: Element | string,
    options?: optionsType & { props: { [prop_id: string]: string}},
    children?: Function[]
): Function {

    const component = new ComponentConstructor(undefined, options || {});

    return function mounter(state?: stateType, ctx?: Component): Promise<Component> {

        const root = typeof el === 'string' && ctx ? qs(el, ctx.$el) : el;

        component.mount(root);

        if (!ctx) {
            component.init(state);
        }

        if (Array.isArray(children) && children.length > 0) {
            children.map((child) => {
                const inst = child(undefined, component);
                return component.setRef({ component: inst, id: (inst.options.id || inst._uid), props: inst.options.props });
            });
        }

        return component;
    };
};

export default mount;