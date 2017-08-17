// @flow

export const UID_PREFIX: string = '_ui.';

let uid: number = -1;
export const nextUid = (prefix: string = UID_PREFIX): string => prefix + (++uid); //eslint-disable-line no-plusplus


const funcToString = Function.prototype.toString;
const objProto = Object.prototype;
const objToString = objProto.toString;
const hasOwnProperty = objProto.hasOwnProperty;
const objectCtorString = funcToString.call(Object);

export const isObjectLike = (value: any): boolean => !!value && typeof value === 'object';

export const isPlainObject = (value: any): boolean => {
    if (!isObjectLike(value) || objToString.call(value) !== '[object Object]') {
        return false;
    }
    const proto = Object.getPrototypeOf(value);
    if (proto === null) {
        return true;
    }
    const Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
    return (typeof Ctor === 'function' && Ctor instanceof Ctor && funcToString.call(Ctor) === objectCtorString);
};

export const isElement = (value: any): boolean => (
    !!value && value.nodeType === 1 && isObjectLike(value) && !isPlainObject(value)
);

//https://developer.mozilla.org/it/docs/Web/JavaScript/Reference/Global_Objects/Object/assign#Polyfill
export const assign = Object.assign || function assignFn(target?: ?Object, ...sources?: Array<Object>): Object {

    if (target === undefined || target === null) {
        throw new TypeError('Cannot convert first argument to object');
    }

    const to = Object(target);
    for (let i = 1, l = sources.length; i < l; i += 1) {
        let nextSource = sources[i];
        if (nextSource === undefined || nextSource === null) {
            continue; //eslint-disable-line no-continue
        }
        nextSource = Object(nextSource);

        const keysArray = Object.keys(Object(nextSource));
        for (let nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex += 1) {
            const nextKey = keysArray[nextIndex];
            const desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
            if (desc !== undefined && desc.enumerable) {
                to[nextKey] = nextSource[nextKey];
            }
        }
    }
    return to;
};