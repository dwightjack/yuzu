// @flow
import { qs } from 'tsumami';

import type Component from './component';

/**
 * `mount` is an helper function to setup trees of components in a functional way.
 *
 * Returns a mount function which in turn accepts a state object and a parent component.
 *
 * It accepts 4 arguments:
 *
 * * a component constructor (either created by extending `Component` or by [`Component.create`](./component.md#create))
 * * a mount DOM node (either a CSS selector string or a DOM element)
 * * component options _(optional)_
 * * An optional array of children mount functions OR a function returning an array of children mount functions (usually yuzu's [`Children`](./children.md) function)
 *
 * Child components will be automatically set as references in the parent component (uses: [`Component#setRef`](./component.md#setref))
 *
 * ### A simple, single component example:
 *
 * ```js
 * import { mount } from 'yuzu';
 *
 * import GalleryComponent from './components/Gallery';
 *
 * const tree = mount(
 *  GalleryComponent,
 *  '#gallery', //mount point,
 *  { theme: 'red' } //options
 * );
 *
 * //attach the tree with an initial state passed to the root component
 * const gallery = tree({ startIndex: 1 })
 * ```
 *
 * ### A components' tree example
 *
 * Props can be passed to children components by setting a `prop` property on the `options` object
 *
 * ```js
 * import { mount } from 'yuzu';
 *
 * import List from './components/List';
 * import ListItem from './components/ListItem';
 *
 * const tree = mount(
 *  List,
 *  '#list', //mount point,
 *  null, //empty options
 *  [
 *      mount(ListItem, '.list-item1', { id: 'item1', props: { currentItem: 'current'} }),
 *      mount(ListItem, '.list-item2', { id: 'item2', props: { currentItem: 'current'} })
 *  ]
 * );
 *
 * //attach the tree with an initial state passed to the root component
 * const list = tree({ currentItem: 0 })
 *
 * //access child components
 * list.$refs.item1.$el.className === '.list-item1';
 * list.$refs.item2.$el.className === '.list-item2';
 * ```
 *
 * ### A dynamic components' tree example
 *
 * Props can be passed to children components by setting a `prop` property on the `options` object
 *
 * ```js
 * import { mount, Children } from 'yuzu';
 *
 * import List from './components/List';
 * import ListItem from './components/ListItem';
 *
 * const tree = mount(
 *  List,
 *  '#list', //mount point,
 *  null, //empty options
 *  Children('.list-item', (el, id) => {
 *      return mount(ListItem, el, { id: `item${i}`, props: { currentItem: 'current'} });
 *  })
 * );
 *
 * //attach the tree with an initial state passed to the root component
 * const list = tree({ currentItem: 0 })
 * ```
 *
 * ### Mixed dynamic and static child tree
 *
 * ```js
 * import { mount, Children } from 'yuzu';
 *
 * import List from './components/List';
 * import ListItem from './components/ListItem';
 * import Navigation from './components/Navigation';
 *
 * // setup a dynamic child list function
 * const listItemsTree = Children('.list-item', (el, id) => {
 *      return mount(ListItem, el, { id: `list-item-${i}`, props: { currentItem: 'current'} });
 * });
 *
 * const tree = mount(
 *  List,
 *  '#list', //mount point,
 *  null, //empty options
 *  (parent) => { // <-- parent is the current instance of `List`
 *      return [
 *          ...listItemsTree(parent),
 *          mount(Navigation, '.nav')
 *      ]
 *  }
 * );
 *
 * //attach the tree with an initial state passed to the root component
 * const list = tree({ currentItem: 0 })
 * ```
 */
const mount = function mount(
    ComponentConstructor: Class<Component>,
    el: Element | string,
    options?: optionsType & { props?: { [prop_id: string]: string}},
    children?: Function | Function[]
): Function {

    const component = new ComponentConstructor(undefined, options || {});

    return function mounter(state?: stateType, ctx?: Component): Component {

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
            const { id, props } = inst.options;

            component.setRef({ component: inst, id: (id || `${component._uid}__${i}`), props });
        }

        return component;
    };
};

export default mount;