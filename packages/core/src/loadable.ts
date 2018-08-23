import { noop, isElement, evaluate } from '@yuzu/utils';
import { Component } from './component';
import { IObject } from '../types';

export interface ILoadableOptions {
  component: typeof Component;
  loader?: typeof Component | null;
  template?: (...args: any[]) => string | void;
  fetchData: (ctx: Component) => IObject | void;
  options?: IObject;
  props?: IObject | ((props: IObject) => IObject);
}

export const Loadable = (opts: ILoadableOptions) => {
  const { component: Child, ...params } = opts;

  const LoadableComponent = class extends Component {
    public static root = `[data-loadable][data-component="${Child.name}"]`;

    public static defaultOptions = (): ILoadableOptions => ({
      fetchData: noop,
      component: Component,
      template: noop,
      loader: null,
      options: {},
      props: {},
    });

    public state = {
      props: {},
    };

    constructor(options: IObject) {
      super(options);
      Object.assign(this.options, params);
    }

    public async mounted() {
      const { fetchData } = this.options;
      const $el = this.$el as Element;

      // empty the component
      $el.textContent = '';
      this.$els.async = $el.appendChild(document.createElement('div'));

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

    public render() {
      const { template } = this.options;
      const { props } = this.state;
      const wrapper = document.createElement('div');
      const html = template({ props });

      if (html) {
        wrapper.innerHTML = html;
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
