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
      | IAbstractRefConstructor<typeof Component>
      | IRefInstance<Component>
      | IAbstractRefFactory<Component>,
    props?: IState,
  ) => Promise<DetachedComponent>;
}

/**
 * `DetachedComponent` is a special kind of `Component` that does not have a root element (`$el`).
 *
 * @class
 * @see [Component](/packages/yuzu/api/component)
 * @returns {DetachedComponent}
 */
export class DetachedComponent extends Component {
  public detached = true;
}
