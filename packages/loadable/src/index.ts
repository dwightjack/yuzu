import { noop, isElement, evaluate } from '@yuzu/utils';
import { Component } from '@yuzu/core';
import { IObject } from '@yuzu/core/types';

export interface ILoadableOptions {
  component: typeof Component;
  loader?: typeof Component | null;
  template?: (...args: any[]) => string | void;
  asyncTag?: string | (($el: Element) => Element);
  fetchData: (ctx: Component) => IObject | void;
  options?: IObject;
  props?: IObject | ((props: IObject) => IObject);
}

/**
 * A function that returns a configurable async component loader.
 *
 * @param {object} opts
 * @param {Component} opts.component Component to make async
 * @param {*} opts.* Any other property will be merged with the Loadable default options
 * @returns {LoadableComponent} Component constructor
 * @example
 *
 * class Message extends Component {}
 * class Loader extends Component {}
 *
 * const delay = () => new Promise((resolve) => {
 *   setTimeout(() => {
 *     resolve({ message: 'Hello World' });
 *   }, 1000);
 * });
 *
 * const template = (props) => `<div class="Message">${props.message}</div>`;
 *
 * const LoadableMessage = Loadable({
 *   component: Message,
 *   loader: Loader,
 *   fetchData: delay,
 *   template
 * });
 *
 * const message = new LoadableMessage().mount('#loadable-message');
 */
export const Loadable = (opts: ILoadableOptions) => {
  const { component: Child, ...params } = opts;

  /**
   * Async component loader
   *
   * @class
   * @extends Component
   * @param {object} [config]
   * @param {Component} config.component Component to initialize when `config.fetchData` is resolved
   * @param {function} [config.fetchData] A function to load remote data. Must return a promise
   * @param {function} [config.template] Component template. A function returning a string
   * @param {Component} [config.loader] Loader component. Shown during `config.fetchData` execution
   * @param {string|function} [config.asyncTag='div'] Tag used for the element holding the async component. Either a string or a function returning a DOM element.
   * @param {object} [config.options] Component options
   * @param {props} [config.props] Computed state attached to the component
   * @returns {LoadableComponent}
   */
  const LoadableComponent = class extends Component {
    public static root = `[data-loadable][data-component="${Child.name}"]`;

    public static defaultOptions = (): ILoadableOptions =>
      Object.assign(
        {
          fetchData: noop,
          component: Child,
          template: noop,
          loader: null,
          options: {},
          asyncTag: 'div',
          props: {},
        },
        params,
      );

    public state = {
      props: {},
    };

    /**
     * Mounted hook
     *
     * Will replace the current root element contents with an empty element used as root for both the optional loader (passed as `config.loader` to the constructor)
     * and the async component.
     *
     * It will then set the loader (if available) and fetch the data (`config.fetchData`) before initializing the async component.
     * @async
     * @memberof LoadableComponent
     * @returns {LoadableComponent}
     */
    public async mounted() {
      const { fetchData, asyncTag } = this.options as ILoadableOptions &
        IObject;
      const { $el } = this;

      // empty the component
      $el.textContent = '';
      let async: Element;
      if (asyncTag) {
        async =
          typeof asyncTag === 'string'
            ? document.createElement(asyncTag)
            : asyncTag($el);
      } else {
        throw new TypeError(
          '"options.asyncTag" must be either a function or a string',
        );
      }

      this.$els.async = $el.appendChild(async);

      await this.setLoader();

      try {
        const data = await fetchData(this);
        if (data) {
          this.setState({ props: data });
        }
        const root = await this.render();
        return this.setComponent(root);
      } catch (e) {
        console.error(e); // tslint:disable-line no-console
        return this;
      }
    }

    /**
     * Initializes the async component as child of the loadable instance.
     *
     * The component will be attached as component child into `$refs.async`.
     *
     * @memberof LoadableComponent
     * @param {Element} [root] Component root element. Will default the `$els.async` if not defined.
     * @return {Promise}
     * @example
     * class Loader extends Component {
     *   // ...
     * }
     *
     * const LoadableMessage = Loadable({
     *   component: Message,
     * });
     *
     * const loadable = new LoadableMessage();
     * loadable.setComponent()
     *
     * instanceof loadable.$refs.async === Message
     */
    public setComponent(root: Element | null) {
      const { component, options, props } = this.options;

      return this.setRef(
        {
          el: isElement(root) ? root : this.$els.async,
          id: 'async',
          component,
          ...options,
        },
        evaluate(props, this.state.props),
      );
    }

    /**
     * Initializes a loader
     *
     * If defined, will initialize the loader component set in `config.loader`,
     * else will return a resolved promise.
     *
     * The loader will be attached as component child into `$refs.async`.
     *
     * @memberof LoadableComponent
     * @returns {Promise}
     * @example
     *
     * class Loader extends Component {
     *   // ...
     * }
     *
     * const LoadableMessage = Loadable({
     *   component: Message,
     *   loader: Loader
     * });
     *
     * const loadable = new LoadableMessage();
     * loadable.setLoader()
     *
     * instanceof loadable.$refs.async === Loader
     */
    public setLoader() {
      const { loader } = this.options;

      if (!loader) {
        return Promise.resolve();
      }

      return this.setRef({
        id: 'async',
        el: this.$els.async,
        component: loader,
      });
    }

    /**
     * Renders the optional template
     *
     * Executes the template function set in `config.template` passing an object containing a `props`
     * key equal to the `state.props` key.
     *
     * @memberof LoadableComponent
     * @returns {string|null} returns null if the template function returns a falsy value
     * @example
     * const template = (props) => `<div>${props.message}</div>`;
     *
     * const LoadableMessage = Loadable({
     *   component: Message,
     *   template
     * });
     *
     * const loadable = new LoadableMessage();
     * loadable.setState({ props: { message: 'Hello World' }});
     * const html = loadable.render();
     * html === '<div>Hello World</div>';
     */
    public render() {
      const { template } = this.options;
      const { props } = this.state;
      const wrapper = document.createElement('div');
      const html = template({ props, options: this.options });

      if (html) {
        wrapper.innerHTML = html;
        if (wrapper.childElementCount > 1) {
          // tslint:disable-next-line no-console
          console.warn(
            'Multi-root templates are not supported. Just the first root element will be rendered.',
          );
        }
        return wrapper.firstElementChild;
      }

      return null;
    }
  };

  Object.defineProperty(LoadableComponent, 'name', {
    value: `Loadable${Child.name || 'Component'}`,
  });

  return LoadableComponent;
};
