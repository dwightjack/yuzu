// @flow

export type optionsType = {[option_key: string]: any};

export type stateType = {[state_key: string]: any};

export type RootElement = Element | string;

export type childIterator = (el: Element, index: number) => any

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