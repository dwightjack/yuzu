declare module 'dush' {
  type ListenerFn = (...args: any[]) => void;

  export interface IEventType {
    [eventId: string]: ListenerFn[];
  }

  type plugin = (app: Idush, options?: { [key: string]: any }) => any | Idush;

  export interface Idush {
    _allEvents: IEventType[];
    use(plugin: plugin, options?: { [key: string]: any }): any | Idush;
    on(name: string | symbol, handler: ListenerFn, once?: boolean): this;
    once(name: string | symbol, handler: ListenerFn): this;
    off(name?: string | symbol, handler?: ListenerFn): this;
    emit(name: string, ...params: any[]): this;
  }

  export default function dush(): Idush;
}
