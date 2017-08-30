// @flow

export type dushInstance = {
    _allEvents: EventType[],
    use(plugin: (app: dushInstance, options?: Object) => any | dushInstance, options?: Object): any | dushInstance,
    on(name: string | Symbol, handler: ListenerFn, once?: boolean): dushInstance,
    once(name: string | Symbol, handler: ListenerFn): dushInstance,
    off(name?: string | Symbol, handler?: ListenerFn): dushInstance,
    emit(name: string, ...params?: any[]): dushInstance
}

declare module 'dush' {

    declare type ListenerFn = (...args: any[]) => void

    declare type EventType = { [event_id: string]: ListenerFn[] }

    declare function dush(): dushInstance;

    declare var exports: dush
}