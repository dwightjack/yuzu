export const mount = (template) => { //eslint-disable-line import/prefer-default-export
    const __html__ = window.__html__ || {}; //eslint-disable-line no-underscore-dangle
    if (__html__[template]) {
        document.body.innerHTML = __html__[template];
    }
};

export const simulate = (el, name, { bubbles = true, cancelable = true } = {}, constructor = 'MouseEvents') => {

    const event = document.createEvent(constructor);

    event.initEvent(name, bubbles, cancelable);
    el.dispatchEvent(event);

    return event;
};