import { Component } from './component';
import {
  IState,
  IAbstractRefConstructor,
  IRefInstance,
  IAbstractRefFactory,
} from '../types';

// tslint:disable-next-line
export interface DetachedComponent extends Component {
  detached: boolean;
  setRef: (
    refCfg:
      | IAbstractRefConstructor<typeof DetachedComponent>
      | IRefInstance<Component>
      | IAbstractRefFactory<Component>,
    props?: IState,
  ) => Promise<DetachedComponent>;
}

export class DetachedComponent extends Component {
  public detached = true;
}
