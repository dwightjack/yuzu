import { Component } from './component';
import { IState, IObject } from '../types';

/**
 * `DetachedComponent` is a special kind of `Component` that does not have a root element (`$el`).
 *
 * @class
 * @see [Component](/packages/yuzu/api/component)
 * @returns {DetachedComponent}
 */
export class DetachedComponent<
  DetachedComponentState extends IState = IState,
  DetachedComponentOptions extends IObject = IObject
> extends Component<DetachedComponentState, DetachedComponentOptions> {
  public detached = true;
}
