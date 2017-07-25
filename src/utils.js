// @flow

export const UID_PREFIX: string = '_ui.';

let uid: number = -1;
export const nextUid = (prefix: string = UID_PREFIX): string => prefix + (++uid); //eslint-disable-line no-plusplus