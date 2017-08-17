// @flow
import { qs } from 'tsumami';

import type Component from './component';

const mount = function mount(
    ComponentConstructor: Class<Component>,
    el: Element | string,
    options?: optionsType & { props?: { [prop_id: string]: string}},
    children?: Function | Function[]
): Function {

    const component = new ComponentConstructor(undefined, options || {});

    return function mounter(state?: stateType, ctx?: Component): Promise<Component> {

        const root = typeof el === 'string' && ctx ? qs(el, ctx.$el) : el;

        component.mount(root);

        if (!ctx) {
            component.init(state);
        }

        const childrenList: Function[] = Array.isArray(children) ? children : [];

        if (typeof children === 'function') {
            childrenList.push(...children(component));
        }

        for (let i = 0, l = childrenList.length; i < l; i++) { //eslint-disable-line no-plusplus
            const child = childrenList[i];
            const inst = child(undefined, component);
            component.setRef({ component: inst, id: (inst.options.id || inst._uid), props: inst.options.props });
        }

        return component;
    };
};

export default mount;