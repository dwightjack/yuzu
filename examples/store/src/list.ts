import { Component } from 'yuzu';

export interface IListState {
  items: string[];
}

export interface IListOptions {
  onClick: () => any;
}

export class List extends Component<IListState, IListOptions> {
  public $els!: {
    list: HTMLElement;
  };

  public defaultOptions(): IListOptions {
    return {
      onClick: () => undefined,
    };
  }

  public selectors = {
    list: 'ul',
  };

  public listeners = {
    'click .button': () => this.options.onClick(),
  };
  public state = {
    items: [],
  };

  public actions = {
    items: (items: IListState['items']) => {
      if (items.length > 0) {
        const item = document.createElement('li');

        item.innerText = items[items.length - 1];
        this.$els.list.appendChild(item);
      }
    },
  };
}
