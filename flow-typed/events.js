// @flow

declare module 'events' {
    declare type ListenerFn = (...args: any[]) => void
    declare class EventEmitter {
        static constructor(): EventEmitter,
        static prefixed: string | boolean,
        setMaxListeners(num: number): void,
        eventNames(): (string | Symbol)[],
        listeners(event: string | Symbol, existence?: false): ListenerFn[],
        listeners(event: string | Symbol, existence: true): boolean,
        on(event: string | Symbol, listener: ListenerFn, context?: any): this,
        addListener(event: string | Symbol, listener: ListenerFn, context?: any): this,
        once(event: string | Symbol, listener: ListenerFn, context?: any): this,
        removeAllListeners(event?: string | Symbol): this,
        removeListener(event: string | Symbol, listener?: ListenerFn, context?: any, once?: boolean): this,
        off(event: string | Symbol, listener?: ListenerFn, context?: any, once?: boolean): this,
        emit(event: string, ...params?: any[]): this
    }
    declare var exports: Class<EventEmitter>
}