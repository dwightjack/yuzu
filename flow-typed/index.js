// @flow

export type optionsType = {[option_key: string]: any};

export type stateType = {[state_key: string]: any};

export type refInstanceType = {|
    component: Component,
    id: string,
    props?: {}
|};

export type refConstructorType = {|
    component: Class<Component>,
    id: string,
    el: Element | string,
    opts?: optionsType,
    props?: {}
|};