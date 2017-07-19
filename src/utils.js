
export const UID_PREFIX = '_ui.';

let uid = -1;
export const nextUid = (prefix = UID_PREFIX) => prefix + (++uid); //eslint-disable-line no-plusplus