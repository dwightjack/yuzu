// @flow

export const UID_PREFIX: string = '_ui.';

let uid: number = -1;
export const nextUid = (prefix: string = UID_PREFIX): string => prefix + (++uid); //eslint-disable-line no-plusplus



export const isObjectLike = (value: any): boolean => !!value && typeof value === 'object';



const funcToString = Function.prototype.toString;
const objProto = Object.prototype;
const objToString = objProto.toString;
const hasOwnProperty = objProto.hasOwnProperty;
const objectCtorString = funcToString.call(Object);

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