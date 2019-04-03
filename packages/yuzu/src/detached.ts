import { Component } from './component';

/**
 * `DetachedComponent` is a special kind of `Component` that does not have a root element (`$el`).
 *
 * @class
 * @see [Component](/packages/yuzu/api/component)
 * @returns {DetachedComponent}
 */
export class DetachedComponent<S = any, O = any> extends Component<S, O> {
  public detached = true;
}
