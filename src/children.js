import { qsa } from 'tsumami';

const Children = (selector, fn) => (ctx) => {
    const els = qsa(selector, ctx.$el);
    return els.map(fn);
};

export default Children;