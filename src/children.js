// @flow
import { qsa } from 'tsumami';

import type Component from './index';

const Children = (selector: string, fn: childIterator): Function => (ctx: Component): Array<any> => {
    const els: Array<Element> = qsa(selector, ctx.$el);
    return els.map(fn);
};

export default Children;