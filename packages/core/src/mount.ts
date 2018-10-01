import { qs, isElement } from '@yuzu/utils';
import { Component } from './component';
import { IObject, IState } from '../types';

export type mounterFn = (ctx: Component) => Component;

export interface IMountProps extends IObject {
  state?: IState;
  id?: string;
}

export type mountChildren = mounterFn[] | ((ctx: Component) => mounterFn[]);

let childRefIdx = 0;

/**
 * `mount` is an helper function to setup trees of components in a functional way.
 *
 * Returns a mount function which in turn accepts a parent component. If present, the returning instance will be attached as reference to the parent component.
 *
 * Child components listed in the `children` parameter will be automatically set as references in the component (uses: [`Component#setRef`](/packages/core/api/component#setref))
 *
 * See the guide on **[functional composition](/packages/core/#functional-composition)** for implementation examples.
 *
 * @param {Component} ComponentConstructor A component constructor (either created by extending `Component` or by [`extend`](/packages/core/api/extend))
 * @param {HTMLElement|string} el A mount DOM node (either a CSS selector string or a DOM element)
 * @param {function[]|function} [children] Child components. Either an array of `mount` functions or a function returning an array of mount functions
 * @param {object} [props] Mount props
 * @param {string} [props.id] Optional component id (used to create a reference onto the parent component)
 * @param {object} [props.state] Component initial state
 * @param {*} [props.*] every other property will be passed as instance option
 * @return {function}
 */
export function mount(
  ComponentConstructor: typeof Component,
  el: HTMLElement | string,
  props: IMountProps | null = {},
  children?: mountChildren,
) {
  const { state = {}, id, ...options } = props || ({} as IMountProps);
  const component = new ComponentConstructor(options);

  return function mounter(ctx?: Component) {
    const root = typeof el === 'string' && ctx ? qs(el, ctx.$el) : el;

    if (isElement(root)) {
      component.mount(root, ctx ? null : state);
    }

    if (ctx) {
      ctx.setRef(
        {
          component,
          id: id || `ref__${++childRefIdx}`,
        },
        state,
      );
    }

    const childrenList = Array.isArray(children) ? children : [];

    if (typeof children === 'function') {
      childrenList.push(...children(component));
    }

    for (let i = 0, l = childrenList.length; i < l; i += 1) {
      const child = childrenList[i];
      child(component);
    }

    return component;
  };
}
