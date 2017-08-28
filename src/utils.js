// @flow

/**
 * uid prefix
 *
 * @public
 * @type {string}
 */
export const UID_PREFIX: string = '_ui.';

/**
 * @private
 */
let uid: number = -1;

/**
 * Returns a sequential uid
 */
export const nextUid = (prefix: string = UID_PREFIX): string => prefix + (++uid); //eslint-disable-line no-plusplus


const funcToString = Function.prototype.toString;
const objProto = Object.prototype;
const objToString = objProto.toString;
const hasOwnProperty = objProto.hasOwnProperty;
const objectCtorString = funcToString.call(Object);

/**
 * Checks if a passed-in value has a `typeof` of `object`
 */
export const isObjectLike = (value: any): boolean => !!value && typeof value === 'object';

/**
 * Checks if a value is a plain object (aka: _POJO_)
 */
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

/**
 * Checks if a value is a DOM element
 */
export const isElement = (value: any): boolean => (
    !!value && value.nodeType === 1 && isObjectLike(value) && !isPlainObject(value)
);

/**
 * Extends a target object with properties from passed-in source objects
 *
 * Based on [MDN's polyfill](https://developer.mozilla.org/it/docs/Web/JavaScript/Reference/Global_Objects/Object/assign#Polyfill)
 */
export function extend(target?: ?Object, source?: ?Object): Object { //eslint-disable-line no-unused-vars

    if (target === undefined || target === null) {
        throw new TypeError('Cannot convert first argument to object');
    }

    for (let i = 1, l = arguments.length; i < l; i += 1) {
        const nextSource = arguments[i]; //eslint-disable-line prefer-rest-params
        if (nextSource === undefined || nextSource === null) {
            continue; //eslint-disable-line no-continue
        }

        const keysArray = Object.keys(nextSource);
        for (let nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex += 1) {
            const nextKey = keysArray[nextIndex];
            const desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
            if (desc !== undefined && desc.enumerable) {
                target[nextKey] = nextSource[nextKey]; //eslint-disable-line no-param-reassign
            }
        }
    }
    return target;
}