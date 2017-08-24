// @flow

/**
 * Component options
 */
export type optionsType = {[option_key: string]: any};

/**
 * Component state shape
 */
export type stateType = {[state_key: string]: any};

/**
 * Component root element paramenter
 */
export type RootElement = Element | string;

export type refInstanceType = {|
    component: Component,
    id: string,
    props?: {}
|};

export type refConstructorType = {|
    component: Class<Component>,
    id: string,
    el: RootElement,
    opts?: optionsType,
    props?: {}
|};