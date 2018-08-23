import { Component } from '@yuzu/core';
import { IObject } from '@yuzu/core/types';

export interface IContext {
  getData(): IObject;
  update(payload: IObject): void;
  inject(instance: Component): Component;
}

export const createContext = (data: IObject = {}): IContext => {
  let $data = data;

  return {
    getData() {
      return $data;
    },

    update(payload: IObject) {
      $data = payload;
    },

    inject(instance: Component) {
      Object.defineProperty(instance, '$context', {
        enumerable: false,
        get: () => $data,
      });
      return instance;
    },
  };
};
