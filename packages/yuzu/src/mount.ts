import { qs, isElement, evaluate, createSequence } from 'yuzu-utils';
import { Component } from './component';
import { IState, IComponentConstructable } from '../types';

export type mounterFn<X, C = Component<any, any>> = (ctx?: X) => C;

export type mountEventObject = Record<string, (...args: any[]) => void>;
export type mountEventFn<T> = (ctx: T) => mountEventObject;

export interface IMountProps<T> {
  state?: IState;
  id?: string;
  on?: mountEventObject | mountEventFn<T>;
  [key: string]: any;
}

export type mountChildren<P, C> = mounterFn<C>[] | ((ctx: P) => mounterFn<C>[]);

const childRefIdx = createSequence();

/**
 * `mount` is an helper function to setup trees of components in a functional way.
 *
 * Returns a mount function which in turn accepts a parent component. If present, the returning instance will be attached as reference to the parent component.
 *
 * Child components listed in the `children` parameter will be automatically set as references in the component (uses: [`Component#setRef`](/packages/yuzu/api/component#setref))
 *
 * See the guide on **[functional composition](/packages/yuzu/#functional-composition)** for implementation examples.
 *
 * @param {Component} ComponentConstructor A component constructor (either created by extending `Component` or by [`extend`](/packages/yuzu/api/extend))
 * @param {HTMLElement|string|null} el A mount DOM node (either a CSS selector string or a DOM element). Can be `null` if the component is a [detached component](/packages/yuzu/#detached-components)
 * @param {function[]|function} [children] Child components. Either an array of `mount` functions or a function returning an array of mount functions
 * @param {object} [props] Mount props
 * @param {string} [props.id] Optional component id (used to create a reference onto the parent component)
 * @param {object} [props.state] Component initial state
 * @param {*} [props.*] every other property will be passed as instance option
 * @return {function}
 */
export function mount<C extends Component<any, any> = Component<any, any>>(
  ComponentConstructor: IComponentConstructable<C>,
  el: HTMLElement | string | null,
  props: IMountProps<C> | null = {},
  children?: mountChildren<C, any>,
): mounterFn<C> {
  const { state = {}, id, on = {}, ...options } =
    props || ({} as IMountProps<C>);
  const component = new ComponentConstructor(options);

  return function mounter(ctx) {
    if (!component.detached) {
      const root = typeof el === 'string' ? qs(el, ctx && ctx.$el) : el;

      if (isElement(root)) {
        component.mount(root, ctx ? null : state);
      }
    } else if (component.detached && !ctx) {
      component.init(state);
    }

    if (ctx) {
      ctx.setRef(
        {
          component,
          id: id || childRefIdx(ctx.$uid + '-r.'),
          on: evaluate(on, ctx),
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
