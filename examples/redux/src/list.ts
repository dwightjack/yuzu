import { Component } from '@packages/yuzu/src';

export class List extends Component {
  public static defaultOptions = () => ({
    onClick: () => undefined,
  });
  public selectors = {
    list: 'ul',
  };

  public listeners = {
    'click #button': () => this.options.onClick(),
  };
  public state = {
    items: [],
  };

  public actions = {
    items: (items) => {
      if (items.length > 0) {
        const item = document.createElement('li');

        item.innerText = items[items.length - 1];
        (this.$els.list as Element).appendChild(item);
      }
    },
  };
}
